import type { Metadata } from "next";

import { getDeliveryMethods } from "@/services/delivery";
import { DeliverySettingsForm } from "@/components/admin/delivery/delivery-settings-form";

export const metadata: Metadata = {
  title: "Delivery Settings",
};

export default async function DeliverySettingsPage() {
  const methods = await getDeliveryMethods();

  return <DeliverySettingsForm methods={methods} />;
}
