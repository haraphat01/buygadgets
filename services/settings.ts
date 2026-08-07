import { prisma } from "@/lib/prisma";
import { DEFAULT_POPUP_MESSAGE, type PaymentSettingsValues } from "@/lib/validations/payment-settings";

const PAYMENT_SETTINGS_KEY = "payment_settings";

const DEFAULT_PAYMENT_SETTINGS: PaymentSettingsValues = {
  paystack: { publicKey: "", secretKey: "" },
  creditDirect: { enabled: false, whatsappNumber: "", popupMessage: DEFAULT_POPUP_MESSAGE },
  klump: { enabled: false, whatsappNumber: "" },
};

export async function getSetting<T>(key: string): Promise<T | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row ? (row.value as T) : null;
}

/// Reads stored payment settings. The Paystack secret key is never
/// returned to the caller — callers only need to know whether one is set.
export async function getPaymentSettings(): Promise<{
  values: PaymentSettingsValues;
  hasSecretKey: boolean;
}> {
  const stored = await getSetting<PaymentSettingsValues>(PAYMENT_SETTINGS_KEY);
  const merged = stored
    ? {
        paystack: { ...DEFAULT_PAYMENT_SETTINGS.paystack, ...stored.paystack },
        creditDirect: { ...DEFAULT_PAYMENT_SETTINGS.creditDirect, ...stored.creditDirect },
        klump: { ...DEFAULT_PAYMENT_SETTINGS.klump, ...stored.klump },
      }
    : DEFAULT_PAYMENT_SETTINGS;

  const hasSecretKey = !!merged.paystack.secretKey;

  return {
    values: { ...merged, paystack: { ...merged.paystack, secretKey: "" } },
    hasSecretKey,
  };
}

export { PAYMENT_SETTINGS_KEY };
