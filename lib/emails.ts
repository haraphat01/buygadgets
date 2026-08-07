import { formatNaira } from "@/lib/currency";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function layout(title: string, bodyHtml: string): string {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #18181b;">
      <h1 style="font-size: 18px; margin-bottom: 16px;">${title}</h1>
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #71717a;">BuyGadgets</p>
    </div>
  `;
}

export function buildWelcomeEmail({ firstName }: { firstName: string }) {
  return {
    subject: "Welcome to BuyGadgets",
    html: layout(
      "Welcome to BuyGadgets",
      `<p>Hi ${firstName},</p><p>Your account has been created. You can now track orders, save addresses, and use your wishlist.</p>
       <p><a href="${SITE_URL}/account/orders">View your account</a></p>`,
    ),
  };
}

export function buildPasswordResetEmail({ resetUrl }: { resetUrl: string }) {
  return {
    subject: "Reset your BuyGadgets password",
    html: layout(
      "Reset your password",
      `<p>Click the link below to set a new password. If you didn't request this, you can ignore this email.</p>
       <p><a href="${resetUrl}">Reset password</a></p>`,
    ),
  };
}

export function buildOrderConfirmedEmail({
  firstName,
  orderNumber,
  total,
  items,
  deliveryMethodName,
}: {
  firstName: string;
  orderNumber: string;
  total: number;
  items: { name: string; quantity: number }[];
  deliveryMethodName: string;
}) {
  const itemLines = items.map((item) => `<li>${item.name} x${item.quantity}</li>`).join("");
  return {
    subject: `Order confirmed — ${orderNumber}`,
    html: layout(
      "Order confirmed",
      `<p>Hi ${firstName},</p><p>We've received your order <strong>${orderNumber}</strong>.</p>
       <ul>${itemLines}</ul>
       <p>Total: <strong>${formatNaira(total)}</strong></p>
       <p>Delivery method: ${deliveryMethodName}</p>
       <p><a href="${SITE_URL}/checkout/success?order=${orderNumber}">View order</a></p>`,
    ),
  };
}

export function buildPaymentReceivedEmail({
  firstName,
  orderNumber,
  total,
}: {
  firstName: string;
  orderNumber: string;
  total: number;
}) {
  return {
    subject: `Payment received — ${orderNumber}`,
    html: layout(
      "Payment received",
      `<p>Hi ${firstName},</p><p>We've received your payment of <strong>${formatNaira(total)}</strong> for order <strong>${orderNumber}</strong>. We'll start processing it shortly.</p>`,
    ),
  };
}

export function buildOrderShippedEmail({
  firstName,
  orderNumber,
  trackingNumber,
}: {
  firstName: string;
  orderNumber: string;
  trackingNumber?: string | null;
}) {
  return {
    subject: `Your order has shipped — ${orderNumber}`,
    html: layout(
      "Order shipped",
      `<p>Hi ${firstName},</p><p>Order <strong>${orderNumber}</strong> is on its way.</p>
       ${trackingNumber ? `<p>Tracking number: <strong>${trackingNumber}</strong></p>` : ""}`,
    ),
  };
}

export function buildOrderDeliveredEmail({
  firstName,
  orderNumber,
}: {
  firstName: string;
  orderNumber: string;
}) {
  return {
    subject: `Order delivered — ${orderNumber}`,
    html: layout(
      "Order delivered",
      `<p>Hi ${firstName},</p><p>Order <strong>${orderNumber}</strong> has been delivered. Enjoy!</p>`,
    ),
  };
}

export function buildReadyForPickupEmail({
  firstName,
  orderNumber,
  pickupAddress,
  businessHours,
}: {
  firstName: string;
  orderNumber: string;
  pickupAddress?: string | null;
  businessHours?: string | null;
}) {
  return {
    subject: `Ready for pickup — ${orderNumber}`,
    html: layout(
      "Ready for pickup",
      `<p>Hi ${firstName},</p><p>Order <strong>${orderNumber}</strong> is ready for pickup.</p>
       ${pickupAddress ? `<p>Address: ${pickupAddress}</p>` : ""}
       ${businessHours ? `<p>Hours: ${businessHours}</p>` : ""}`,
    ),
  };
}
