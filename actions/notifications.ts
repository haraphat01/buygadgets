"use server";

import { revalidatePath } from "next/cache";

import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";

export async function markNotificationRead(id: string): Promise<ActionResult> {
  await getAdminSession();
  await prisma.notification.update({ where: { id }, data: { read: true } });
  revalidatePath("/admin", "layout");
  return { success: true, data: undefined };
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  await getAdminSession();
  await prisma.notification.updateMany({ where: { profileId: null, read: false }, data: { read: true } });
  revalidatePath("/admin", "layout");
  return { success: true, data: undefined };
}
