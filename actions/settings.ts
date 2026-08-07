"use server";

import { revalidatePath } from "next/cache";

import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  paymentSettingsSchema,
  type PaymentSettingsValues,
} from "@/lib/validations/payment-settings";
import { getSetting, PAYMENT_SETTINGS_KEY } from "@/services/settings";
import type { ActionResult } from "@/types";

export async function updatePaymentSettings(
  values: PaymentSettingsValues,
): Promise<ActionResult> {
  await getAdminSession();
  const parsed = paymentSettingsSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Check the form for errors." };
  }

  const existing = await getSetting<PaymentSettingsValues>(PAYMENT_SETTINGS_KEY);

  // A blank secret key means "leave it unchanged" — never overwrite a
  // stored secret with an empty value just because the field renders blank.
  const secretKey = parsed.data.paystack.secretKey
    ? parsed.data.paystack.secretKey
    : (existing?.paystack.secretKey ?? "");

  const value: PaymentSettingsValues = {
    ...parsed.data,
    paystack: { ...parsed.data.paystack, secretKey },
  };

  await prisma.setting.upsert({
    where: { key: PAYMENT_SETTINGS_KEY },
    update: { value },
    create: { key: PAYMENT_SETTINGS_KEY, value },
  });

  revalidatePath("/admin/payment-settings");
  return { success: true, data: undefined };
}
