"use server";

import { revalidatePath } from "next/cache";

import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { flashSaleSchema, type FlashSaleValues } from "@/lib/validations/flash-sale";
import type { ActionResult } from "@/types";

export async function toggleProductFeatured(id: string, featured: boolean): Promise<ActionResult> {
  await getAdminSession();
  await prisma.product.update({ where: { id }, data: { featured } });
  revalidatePath("/admin/homepage");
  revalidatePath("/admin/products");
  return { success: true, data: undefined };
}

export async function toggleCategoryFeatured(id: string, featured: boolean): Promise<ActionResult> {
  await getAdminSession();
  await prisma.category.update({ where: { id }, data: { featured } });
  revalidatePath("/admin/homepage");
  revalidatePath("/admin/categories");
  return { success: true, data: undefined };
}

export async function setFlashSale(values: FlashSaleValues): Promise<ActionResult> {
  await getAdminSession();
  const parsed = flashSaleSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Check the form for errors." };
  }

  await prisma.product.update({
    where: { id: parsed.data.productId },
    data: {
      discountPrice: parsed.data.discountPrice,
      flashSaleEndsAt: new Date(parsed.data.flashSaleEndsAt),
    },
  });
  revalidatePath("/admin/homepage");
  revalidatePath("/admin/products");
  return { success: true, data: undefined };
}

export async function endFlashSale(productId: string): Promise<ActionResult> {
  await getAdminSession();
  await prisma.product.update({
    where: { id: productId },
    data: { flashSaleEndsAt: null },
  });
  revalidatePath("/admin/homepage");
  revalidatePath("/admin/products");
  return { success: true, data: undefined };
}
