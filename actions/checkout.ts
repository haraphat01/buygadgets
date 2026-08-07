"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { clearCartCouponCode, getCartSessionId } from "@/lib/cart-session";
import { checkoutSchema, type CheckoutValues } from "@/lib/validations/checkout";
import { generateOrderNumber } from "@/lib/order-number";
import { buildOrderWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatNaira } from "@/lib/currency";
import { notifyAdmins, notifyIfStockCrossedThreshold } from "@/lib/notifications";
import { getOptionalCustomerSession } from "@/lib/customer-auth";
import { sendEmail } from "@/lib/email";
import { buildOrderConfirmedEmail } from "@/lib/emails";
import { getCart } from "@/services/cart";
import { getSetting } from "@/services/settings";
import type { PaymentSettingsValues } from "@/lib/validations/payment-settings";
import { PAYMENT_SETTINGS_KEY } from "@/services/settings";
import type { ActionResult } from "@/types";

export async function placeOrder(
  values: CheckoutValues,
): Promise<ActionResult<{ orderNumber: string; whatsappUrl?: string }>> {
  const parsed = checkoutSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Check the form for errors." };
  }

  const sessionId = await getCartSessionId();
  if (!sessionId) {
    return { success: false, error: "Your cart is empty." };
  }

  const cart = await getCart();
  if (cart.items.length === 0) {
    return { success: false, error: "Your cart is empty." };
  }

  const deliveryMethod = await prisma.deliveryMethod.findUnique({
    where: { id: parsed.data.deliveryMethodId },
  });
  if (!deliveryMethod || !deliveryMethod.active) {
    return { success: false, error: "Select a valid delivery method." };
  }

  const deliveryFee = Number(deliveryMethod.fee);
  const total = Math.max(0, cart.subtotal - cart.discount) + deliveryFee;
  const paystackReference = randomUUID();
  const orderNumber = generateOrderNumber();

  // If a customer is logged in, attach the order to their existing
  // account instead of upserting a fresh guest Customer by email.
  const customerSession = await getOptionalCustomerSession();

  let createdOrderId: string;
  try {
    createdOrderId = await prisma.$transaction(async (tx) => {
      // Re-validate stock inside the transaction — the cart snapshot could
      // be stale by the time checkout is submitted. Captures the
      // pre-decrement quantity per product so the notification check below
      // can detect a low/out-of-stock threshold crossing.
      const previousQuantityByProduct = new Map<string, number>();
      for (const item of cart.items) {
        const product = await tx.product.findUniqueOrThrow({ where: { id: item.productId } });
        if (product.quantity < item.quantity) {
          throw new Error(`${item.name} only has ${product.quantity} left in stock.`);
        }
        previousQuantityByProduct.set(item.productId, product.quantity);
        if (item.variantId) {
          const variant = await tx.productVariant.findUniqueOrThrow({ where: { id: item.variantId } });
          if (variant.quantity < item.quantity) {
            throw new Error(`${item.name} (${item.variantName}) only has ${variant.quantity} left in stock.`);
          }
        }
      }

      const customer = customerSession
        ? customerSession.customer
        : await tx.customer.upsert({
            where: { email: parsed.data.email },
            update: {
              firstName: parsed.data.firstName,
              lastName: parsed.data.lastName,
              phone: parsed.data.phone,
            },
            create: {
              email: parsed.data.email,
              firstName: parsed.data.firstName,
              lastName: parsed.data.lastName,
              phone: parsed.data.phone,
              isGuest: true,
            },
          });

      await tx.address.create({
        data: {
          customerId: customer.id,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          phone: parsed.data.phone,
          state: parsed.data.state,
          city: parsed.data.city,
          address: parsed.data.address,
        },
      });

      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          email: parsed.data.email,
          phone: parsed.data.phone,
          state: parsed.data.state,
          city: parsed.data.city,
          address: parsed.data.address,
          orderNotes: parsed.data.orderNotes || null,
          deliveryMethodId: deliveryMethod.id,
          deliveryFee,
          couponId: cart.coupon ? (await tx.coupon.findUnique({ where: { code: cart.coupon.code } }))?.id : null,
          subtotal: cart.subtotal,
          discount: cart.discount,
          total,
          status: parsed.data.paymentMethod === "PAYSTACK" ? "AWAITING_PAYMENT" : "PENDING",
          paymentMethod: parsed.data.paymentMethod,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              name: item.variantName ? `${item.name} (${item.variantName})` : item.name,
              price: item.unitPrice,
              quantity: item.quantity,
              subtotal: item.lineTotal,
            })),
          },
          payments: {
            create: {
              method: parsed.data.paymentMethod,
              status: "PENDING",
              amount: total,
              reference: parsed.data.paymentMethod === "PAYSTACK" ? paystackReference : null,
            },
          },
        },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { quantity: { decrement: item.quantity } },
          });
        }

        const previousQuantity = previousQuantityByProduct.get(item.productId)!;
        await notifyIfStockCrossedThreshold(tx, {
          productId: item.productId,
          productName: item.name,
          previousQuantity,
          newQuantity: previousQuantity - item.quantity,
        });
      }

      if (cart.coupon) {
        await tx.coupon.update({
          where: { code: cart.coupon.code },
          data: { usedCount: { increment: 1 } },
        });
      }

      await tx.cartItem.deleteMany({ where: { sessionId } });

      await notifyAdmins(
        tx,
        "NEW_ORDER",
        "New order received",
        `${orderNumber} — ${parsed.data.firstName} ${parsed.data.lastName}, ${formatNaira(total)}`,
      );

      return order.id;
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not place your order.",
    };
  }

  await clearCartCouponCode();

  await sendEmail({
    to: parsed.data.email,
    ...buildOrderConfirmedEmail({
      firstName: parsed.data.firstName,
      orderNumber,
      total,
      items: cart.items.map((item) => ({
        name: item.variantName ? `${item.name} (${item.variantName})` : item.name,
        quantity: item.quantity,
      })),
      deliveryMethodName: deliveryMethod.name,
    }),
  });

  if (parsed.data.paymentMethod === "PAYSTACK") {
    const authorizationUrl = await initializePaystackTransaction({
      email: parsed.data.email,
      amount: total,
      reference: paystackReference,
      orderNumber,
    });

    if (!authorizationUrl) {
      await prisma.payment.updateMany({
        where: { orderId: createdOrderId, reference: paystackReference },
        data: { status: "FAILED" },
      });
      return {
        success: false,
        error: "Could not start the Paystack payment. Please try again or choose another payment method.",
      };
    }

    redirect(authorizationUrl);
  }

  const paymentSettings = await getSetting<PaymentSettingsValues>(PAYMENT_SETTINGS_KEY);
  const whatsappNumber =
    parsed.data.paymentMethod === "CREDIT_DIRECT"
      ? paymentSettings?.creditDirect.whatsappNumber
      : paymentSettings?.klump.whatsappNumber;

  if (!whatsappNumber) {
    return {
      success: false,
      error: "This payment option isn't configured yet. Please choose another payment method.",
    };
  }

  const message = buildOrderWhatsAppMessage({
    customerName: `${parsed.data.firstName} ${parsed.data.lastName}`,
    phone: parsed.data.phone,
    email: parsed.data.email,
    deliveryAddress: `${parsed.data.address}, ${parsed.data.city}, ${parsed.data.state}`,
    items: cart.items.map((item) => ({
      name: item.variantName ? `${item.name} (${item.variantName})` : item.name,
      quantity: item.quantity,
    })),
    total,
    deliveryMethodName: deliveryMethod.name,
    orderNumber,
    preferredPayment: parsed.data.paymentMethod === "CREDIT_DIRECT" ? "Credit Direct" : "Klump",
  });

  return {
    success: true,
    data: { orderNumber, whatsappUrl: buildWhatsAppUrl(whatsappNumber, message) },
  };
}

async function initializePaystackTransaction({
  email,
  amount,
  reference,
  orderNumber,
}: {
  email: string;
  amount: number;
  reference: string;
  orderNumber: string;
}): Promise<string | null> {
  const paymentSettings = await getSetting<PaymentSettingsValues>(PAYMENT_SETTINGS_KEY);
  const secretKey = paymentSettings?.paystack.secretKey;
  if (!secretKey) return null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100),
        reference,
        callback_url: `${siteUrl}/api/paystack/callback?order=${orderNumber}`,
      }),
    });

    const json = await response.json();
    if (!response.ok || !json.status) return null;
    return json.data?.authorization_url ?? null;
  } catch {
    return null;
  }
}
