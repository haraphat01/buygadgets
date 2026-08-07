"use server";

import { revalidatePath } from "next/cache";

import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categorySchema, type CategoryValues } from "@/lib/validations/category";
import type { ActionResult } from "@/types";

export async function createCategory(
  values: CategoryValues,
): Promise<ActionResult> {
  await getAdminSession();
  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Check the form for errors." };
  }

  try {
    await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        imageUrl: parsed.data.imageUrl || null,
        parentId: parsed.data.parentId || null,
      },
    });
  } catch {
    return { success: false, error: "A category with that slug already exists." };
  }

  revalidatePath("/admin/categories");
  return { success: true, data: undefined };
}

export async function updateCategory(
  values: CategoryValues,
): Promise<ActionResult> {
  await getAdminSession();
  const parsed = categorySchema.safeParse(values);
  if (!parsed.success || !parsed.data.id) {
    return { success: false, error: "Check the form for errors." };
  }

  if (parsed.data.parentId === parsed.data.id) {
    return { success: false, error: "A category can't be its own parent." };
  }

  try {
    await prisma.category.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        imageUrl: parsed.data.imageUrl || null,
        parentId: parsed.data.parentId || null,
      },
    });
  } catch {
    return { success: false, error: "A category with that slug already exists." };
  }

  revalidatePath("/admin/categories");
  return { success: true, data: undefined };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await getAdminSession();

  const productCount = await prisma.product.count({
    where: { categoryId: id },
  });
  if (productCount > 0) {
    return {
      success: false,
      error: `${productCount} product(s) still use this category. Move or delete them first.`,
    };
  }

  await prisma.category.updateMany({
    where: { parentId: id },
    data: { parentId: null },
  });
  await prisma.category.delete({ where: { id } });

  revalidatePath("/admin/categories");
  return { success: true, data: undefined };
}
