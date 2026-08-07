import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSetting, PAYMENT_SETTINGS_KEY } from "@/services/settings";
import { sendEmail } from "@/lib/email";
import { buildPaymentReceivedEmail } from "@/lib/emails";
import type { PaymentSettingsValues } from "@/lib/validations/payment-settings";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");
  const orderNumber = searchParams.get("order");

  if (!reference || !orderNumber) {
    return NextResponse.redirect(new URL("/checkout?error=missing-reference", request.url));
  }

  const paymentSettings = await getSetting<PaymentSettingsValues>(PAYMENT_SETTINGS_KEY);
  const secretKey = paymentSettings?.paystack.secretKey;

  if (!secretKey) {
    return NextResponse.redirect(new URL("/checkout?error=payment-not-configured", request.url));
  }

  let verified = false;
  let providerResponse: unknown = null;

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const json = await response.json();
    providerResponse = json;
    verified = response.ok && json.status === true && json.data?.status === "success";
  } catch {
    verified = false;
  }

  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: { order: true },
  });
  if (!payment) {
    return NextResponse.redirect(new URL("/checkout?error=order-not-found", request.url));
  }

  if (verified) {
    await prisma.$transaction([
      prisma.payment.update({
        where: { reference },
        data: {
          status: "PAID",
          paidAt: new Date(),
          providerResponse: providerResponse as object,
        },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "PAID" },
      }),
    ]);

    await sendEmail({
      to: payment.order.email,
      ...buildPaymentReceivedEmail({
        firstName: payment.order.firstName,
        orderNumber: payment.order.orderNumber,
        total: Number(payment.order.total),
      }),
    });

    return NextResponse.redirect(new URL(`/checkout/success?order=${orderNumber}`, request.url));
  }

  await prisma.payment.update({
    where: { reference },
    data: { status: "FAILED", providerResponse: providerResponse as object },
  });

  return NextResponse.redirect(new URL(`/checkout?error=payment-failed`, request.url));
}
