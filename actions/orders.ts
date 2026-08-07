"use server";

import { revalidatePath } from "next/cache";

import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  updateOrderStatusSchema,
  type UpdateOrderStatusValues,
} from "@/lib/validations/order";
import { sendEmail } from "@/lib/email";
import {
  buildOrderDeliveredEmail,
  buildOrderShippedEmail,
  buildReadyForPickupEmail,
} from "@/lib/emails";
import type { ActionResult } from "@/types";

export async function updateOrderStatus(
  orderId: string,
  values: UpdateOrderStatusValues,
): Promise<ActionResult> {
  const session = await getAdminSession();
  const parsed = updateOrderStatusSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Check the form for errors." };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, deliveryMethod: true },
  });
  if (!order) {
    return { success: false, error: "Order not found." };
  }

  const { status, trackingNumber } = parsed.data;
  const isNewlyCancelled =
    status === "CANCELLED" && order.status !== "CANCELLED" && order.status !== "REFUNDED";
  const statusChanged = status !== order.status;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status, trackingNumber: trackingNumber || null },
    });

    if (isNewlyCancelled) {
      for (const item of order.items) {
        if (!item.productId) continue;
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { increment: item.quantity } },
        });
      }
    }

    await tx.activityLog.create({
      data: {
        actorId: session.adminUser.profileId,
        action: "order_status_changed",
        entityType: "order",
        entityId: orderId,
        metadata: {
          orderNumber: order.orderNumber,
          previousStatus: order.status,
          newStatus: status,
          stockRestored: isNewlyCancelled,
        },
      },
    });
  });

  if (statusChanged) {
    if (status === "SHIPPED") {
      await sendEmail({
        to: order.email,
        ...buildOrderShippedEmail({
          firstName: order.firstName,
          orderNumber: order.orderNumber,
          trackingNumber: trackingNumber || order.trackingNumber,
        }),
      });
    } else if (status === "DELIVERED") {
      await sendEmail({
        to: order.email,
        ...buildOrderDeliveredEmail({ firstName: order.firstName, orderNumber: order.orderNumber }),
      });
    } else if (status === "READY_FOR_PICKUP") {
      await sendEmail({
        to: order.email,
        ...buildReadyForPickupEmail({
          firstName: order.firstName,
          orderNumber: order.orderNumber,
          pickupAddress: order.deliveryMethod?.pickupAddress,
          businessHours: order.deliveryMethod?.businessHours,
        }),
      });
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  if (isNewlyCancelled) revalidatePath("/admin/inventory");
  return { success: true, data: undefined };
}

export async function refundOrder(orderId: string): Promise<ActionResult> {
  const session = await getAdminSession();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: true },
  });
  if (!order) {
    return { success: false, error: "Order not found." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: "REFUNDED" } });
    await tx.payment.updateMany({
      where: { orderId, status: "PAID" },
      data: { status: "REFUNDED" },
    });
    await tx.activityLog.create({
      data: {
        actorId: session.adminUser.profileId,
        action: "order_refunded",
        entityType: "order",
        entityId: orderId,
        metadata: { orderNumber: order.orderNumber, previousStatus: order.status },
      },
    });
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true, data: undefined };
}
