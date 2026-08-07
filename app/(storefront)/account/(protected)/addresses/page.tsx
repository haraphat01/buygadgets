import type { Metadata } from "next";

import { getCustomerSession } from "@/lib/customer-auth";
import { getCustomerAddresses } from "@/services/customer-account";
import { AddressesClient } from "./addresses-client";

export const metadata: Metadata = {
  title: "Addresses",
};

export default async function AddressesPage() {
  const session = await getCustomerSession();
  const addresses = await getCustomerAddresses(session.customer.id);

  return <AddressesClient addresses={addresses} />;
}
