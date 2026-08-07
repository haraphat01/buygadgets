import type { Metadata } from "next";

import { getPaymentSettings } from "@/services/settings";
import { PaymentSettingsForm } from "@/components/admin/settings/payment-settings-form";

export const metadata: Metadata = {
  title: "Payment Settings",
};

export default async function PaymentSettingsPage() {
  const { values, hasSecretKey } = await getPaymentSettings();

  return <PaymentSettingsForm values={values} hasSecretKey={hasSecretKey} />;
}
