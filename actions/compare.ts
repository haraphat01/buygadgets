"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { ensureCartSessionId } from "@/lib/cart-session";
import { MAX_COMPARE_ITEMS, getCompareProductIds } from "@/services/compare";
import type { ActionResult } from "@/types";

export async function addToCompare(productId: string): Promise<ActionResult> {
  const currentIds = await getCompareProductIds();

  if (currentIds.includes(productId)) {
    return { success: true, data: undefined };
  }

  if (currentIds.length >= MAX_COMPARE_ITEMS) {
    return {
      success: false,
      error: `You can compare up to ${MAX_COMPARE_ITEMS} products. Remove one to add another.`,
    };
  }

  const sessionId = await ensureCartSessionId();
  await prisma.compareItem.create({ data: { sessionId, productId } });

  revalidatePath("/compare");
  return { success: true, data: undefined };
}

export async function removeFromCompare(productId: string): Promise<ActionResult> {
  const sessionId = await ensureCartSessionId();
  await prisma.compareItem.deleteMany({ where: { sessionId, productId } });

  revalidatePath("/compare");
  return { success: true, data: undefined };
}

export async function clearCompare(): Promise<ActionResult> {
  const sessionId = await ensureCartSessionId();
  await prisma.compareItem.deleteMany({ where: { sessionId } });

  revalidatePath("/compare");
  return { success: true, data: undefined };
}
