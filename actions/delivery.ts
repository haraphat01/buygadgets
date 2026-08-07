"use server";

import { revalidatePath } from "next/cache";

import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  deliveryMethodsSchema,
  type DeliveryMethodsValues,
} from "@/lib/validations/delivery";
import type { ActionResult } from "@/types";

export async function updateDeliveryMethods(
  values: DeliveryMethodsValues,
): Promise<ActionResult> {
  await getAdminSession();
  const parsed = deliveryMethodsSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Check the form for errors." };
  }

  const { buygadgets, gig, pickup } = parsed.data;

  await prisma.$transaction([
    prisma.deliveryMethod.upsert({
      where: { type: "BUYGADGETS" },
      update: {
        fee: buygadgets.fee,
        estimatedDays: buygadgets.estimatedDays || null,
        active: buygadgets.active,
      },
      create: {
        type: "BUYGADGETS",
        name: "BuyGadgets Delivery",
        fee: buygadgets.fee,
        estimatedDays: buygadgets.estimatedDays || null,
        active: buygadgets.active,
      },
    }),
    prisma.deliveryMethod.upsert({
      where: { type: "GIG_LOGISTICS" },
      update: {
        fee: gig.fee,
        estimatedDays: gig.estimatedDays || null,
        active: gig.active,
      },
      create: {
        type: "GIG_LOGISTICS",
        name: "GIG Logistics",
        fee: gig.fee,
        estimatedDays: gig.estimatedDays || null,
        active: gig.active,
      },
    }),
    prisma.deliveryMethod.upsert({
      where: { type: "PICKUP" },
      update: {
        pickupAddress: pickup.address || null,
        businessHours: pickup.businessHours || null,
        active: pickup.active,
      },
      create: {
        type: "PICKUP",
        name: "Pickup in Store",
        fee: 0,
        pickupAddress: pickup.address || null,
        businessHours: pickup.businessHours || null,
        active: pickup.active,
      },
    }),
  ]);

  revalidatePath("/admin/delivery-settings");
  return { success: true, data: undefined };
}
