"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";

import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/supabase/storage";
import { bannerSchema, type BannerValues } from "@/lib/validations/banner";
import type { ActionResult } from "@/types";

export async function uploadBannerImage(
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  await getAdminSession();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "No file provided." };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const url = await uploadFile(file, `banners/${randomUUID()}.${ext}`);
  return { success: true, data: { url } };
}

function toBannerData(values: BannerValues) {
  return {
    title: values.title,
    imageUrl: values.imageUrl,
    link: values.link || null,
    position: values.position,
    active: values.active,
    startDate: values.startDate ? new Date(values.startDate) : null,
    endDate: values.endDate ? new Date(values.endDate) : null,
  };
}

export async function createBanner(values: BannerValues): Promise<ActionResult> {
  await getAdminSession();
  const parsed = bannerSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Check the form for errors." };
  }

  await prisma.banner.create({ data: toBannerData(parsed.data) });
  revalidatePath("/admin/homepage");
  return { success: true, data: undefined };
}

export async function updateBanner(values: BannerValues): Promise<ActionResult> {
  await getAdminSession();
  const parsed = bannerSchema.safeParse(values);
  if (!parsed.success || !parsed.data.id) {
    return { success: false, error: "Check the form for errors." };
  }

  await prisma.banner.update({
    where: { id: parsed.data.id },
    data: toBannerData(parsed.data),
  });
  revalidatePath("/admin/homepage");
  return { success: true, data: undefined };
}

export async function deleteBanner(id: string): Promise<ActionResult> {
  await getAdminSession();
  await prisma.banner.delete({ where: { id } });
  revalidatePath("/admin/homepage");
  return { success: true, data: undefined };
}
