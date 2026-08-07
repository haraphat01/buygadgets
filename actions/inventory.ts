"use server";

import { revalidatePath } from "next/cache";

import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adjustStockSchema, type AdjustStockValues } from "@/lib/validations/inventory";
import { notifyIfStockCrossedThreshold } from "@/lib/notifications";
import type { ActionResult } from "@/types";

export async function adjustStock(values: AdjustStockValues): Promise<ActionResult> {
  const session = await getAdminSession();
  const parsed = adjustStockSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Check the form for errors." };
  }

  const { productId, newQuantity, threshold, reason } = parsed.data;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { name: true, sku: true, quantity: true },
  });
  if (!product) {
    return { success: false, error: "Product not found." };
  }

  const previousQuantity = product.quantity;

  // A compound-unique upsert on { productId, variantId: null } isn't
  // possible — Prisma (correctly) won't accept `null` in a compound unique
  // where input, since a nullable-column unique index doesn't guarantee a
  // single matching row at the DB level. Find-then-create-or-update instead,
  // inside an interactive transaction.
  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id: productId }, data: { quantity: newQuantity } });

    const existingInventory = await tx.inventory.findFirst({
      where: { productId, variantId: null },
    });
    if (existingInventory) {
      await tx.inventory.update({
        where: { id: existingInventory.id },
        data: { quantity: newQuantity, lowStockThreshold: threshold },
      });
    } else {
      await tx.inventory.create({
        data: { productId, quantity: newQuantity, lowStockThreshold: threshold },
      });
    }

    await tx.activityLog.create({
      data: {
        actorId: session.adminUser.profileId,
        action: "stock_adjustment",
        entityType: "product",
        entityId: productId,
        metadata: {
          productName: product.name,
          sku: product.sku,
          previousQuantity,
          newQuantity,
          delta: newQuantity - previousQuantity,
          reason: reason || null,
        },
      },
    });

    await notifyIfStockCrossedThreshold(tx, {
      productId,
      productName: product.name,
      previousQuantity,
      newQuantity,
    });
  });

  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  return { success: true, data: undefined };
}
