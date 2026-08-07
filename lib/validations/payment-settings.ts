import { z } from "zod";

export const paymentSettingsSchema = z.object({
  paystack: z.object({
    publicKey: z.string().optional(),
    // Blank means "don't change the stored secret" — see actions/settings.ts.
    secretKey: z.string().optional(),
  }),
  creditDirect: z.object({
    enabled: z.boolean().default(false),
    whatsappNumber: z.string().optional(),
    popupMessage: z.string().optional(),
  }),
  klump: z.object({
    enabled: z.boolean().default(false),
    whatsappNumber: z.string().optional(),
  }),
});

export type PaymentSettingsValues = z.infer<typeof paymentSettingsSchema>;
export type PaymentSettingsFormInput = z.input<typeof paymentSettingsSchema>;

export const DEFAULT_POPUP_MESSAGE =
  "Pay a 25% deposit and spread the balance over 6 monthly installments with CDL Checkout (Credit Direct). Get up to ₦1,000,000 in credit, subject to approval. You'll be redirected to Credit Direct to complete your application. Orders are processed after financing is approved.";
