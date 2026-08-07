import "server-only";

import { Resend } from "resend";

let client: Resend | null = null;

function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

/// Fire-and-forget from the caller's perspective — a failed email should
/// never fail the order/account action it's attached to. Logs and swallows
/// errors instead of throwing.
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const resend = getClient();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email:", subject, "to", to);
    return;
  }

  const from = process.env.EMAIL_FROM ?? "BuyGadgets <onboarding@resend.dev>";

  try {
    await resend.emails.send({ from, to, subject, html });
  } catch (error) {
    console.error("Failed to send email:", subject, "to", to, error);
  }
}
