"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";

import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/supabase/storage";
import { brandSchema, type BrandValues } from "@/lib/validations/brand";
import type { ActionResult } from "@/types";

export async function uploadBrandLogo(
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  await getAdminSession();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "No file provided." };
  }

  const ext = file.name.split(".").pop() ?? "png";
  const url = await uploadFile(file, `brands/${randomUUID()}.${ext}`);
  return { success: true, data: { url } };
}

export async function createBrand(values: BrandValues): Promise<ActionResult> {
  await getAdminSession();
  const parsed = brandSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Check the form for errors." };
  }

  try {
    await prisma.brand.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        logoUrl: parsed.data.logoUrl || null,
      },
    });
  } catch {
    return { success: false, error: "A brand with that slug already exists." };
  }

  revalidatePath("/admin/brands");
  return { success: true, data: undefined };
}

export async function updateBrand(values: BrandValues): Promise<ActionResult> {
  await getAdminSession();
  const parsed = brandSchema.safeParse(values);
  if (!parsed.success || !parsed.data.id) {
    return { success: false, error: "Check the form for errors." };
  }

  try {
    await prisma.brand.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        logoUrl: parsed.data.logoUrl || null,
      },
    });
  } catch {
    return { success: false, error: "A brand with that slug already exists." };
  }

  revalidatePath("/admin/brands");
  return { success: true, data: undefined };
}

export async function deleteBrand(id: string): Promise<ActionResult> {
  await getAdminSession();

  const productCount = await prisma.product.count({ where: { brandId: id } });
  if (productCount > 0) {
    return {
      success: false,
      error: `${productCount} product(s) still use this brand. Move or delete them first.`,
    };
  }

  await prisma.brand.delete({ where: { id } });
  revalidatePath("/admin/brands");
  return { success: true, data: undefined };
}
