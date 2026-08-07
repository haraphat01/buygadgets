"use server";

import { revalidatePath } from "next/cache";

import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { replySchema, type ReplyValues } from "@/lib/validations/review";
import type { ActionResult } from "@/types";
import type { ReviewStatus } from "@/generated/prisma/client";

export async function updateReviewStatus(
  id: string,
  status: Extract<ReviewStatus, "APPROVED" | "REJECTED">,
): Promise<ActionResult> {
  await getAdminSession();
  await prisma.review.update({ where: { id }, data: { status } });
  revalidatePath("/admin/reviews");
  return { success: true, data: undefined };
}

export async function replyToReview(id: string, values: ReplyValues): Promise<ActionResult> {
  await getAdminSession();
  const parsed = replySchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Reply can't be empty." };
  }
  await prisma.review.update({ where: { id }, data: { reply: parsed.data.reply } });
  revalidatePath("/admin/reviews");
  return { success: true, data: undefined };
}

export async function deleteReview(id: string): Promise<ActionResult> {
  await getAdminSession();
  await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/reviews");
  return { success: true, data: undefined };
}
