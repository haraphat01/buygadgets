"use server";

import { revalidatePath } from "next/cache";

import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";

export async function addToWishlist(productId: string): Promise<ActionResult> {
  const session = await getCustomerSession();

  await prisma.wishlist.upsert({
    where: { customerId_productId: { customerId: session.customer.id, productId } },
    update: {},
    create: { customerId: session.customer.id, productId },
  });

  revalidatePath("/account/wishlist");
  return { success: true, data: undefined };
}

export async function removeFromWishlist(productId: string): Promise<ActionResult> {
  const session = await getCustomerSession();

  await prisma.wishlist.deleteMany({ where: { customerId: session.customer.id, productId } });

  revalidatePath("/account/wishlist");
  return { success: true, data: undefined };
}
