"use server";

import { revalidatePath } from "next/cache";

import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { couponSchema, type CouponValues } from "@/lib/validations/coupon";
import type { ActionResult } from "@/types";

function toCouponData(values: CouponValues) {
  return {
    code: values.code,
    type: values.type,
    value: values.value,
    expiryDate: values.expiryDate ? new Date(values.expiryDate) : null,
    usageLimit: values.usageLimit ?? null,
    minimumSpend: values.minimumSpend ?? null,
    active: values.active,
  };
}

export async function createCoupon(values: CouponValues): Promise<ActionResult> {
  await getAdminSession();
  const parsed = couponSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Check the form for errors." };
  }

  try {
    await prisma.coupon.create({ data: toCouponData(parsed.data) });
  } catch {
    return { success: false, error: "A coupon with that code already exists." };
  }

  revalidatePath("/admin/coupons");
  return { success: true, data: undefined };
}

export async function updateCoupon(values: CouponValues): Promise<ActionResult> {
  await getAdminSession();
  const parsed = couponSchema.safeParse(values);
  if (!parsed.success || !parsed.data.id) {
    return { success: false, error: "Check the form for errors." };
  }

  try {
    await prisma.coupon.update({
      where: { id: parsed.data.id },
      data: toCouponData(parsed.data),
    });
  } catch {
    return { success: false, error: "A coupon with that code already exists." };
  }

  revalidatePath("/admin/coupons");
  return { success: true, data: undefined };
}

export async function deleteCoupon(id: string): Promise<ActionResult> {
  await getAdminSession();
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
  return { success: true, data: undefined };
}
