import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCustomerById } from "@/services/customers";
import { CustomerDetailClient } from "@/components/admin/customers/customer-detail-client";

export const metadata: Metadata = {
  title: "Customer Detail",
};

export default async function CustomerDetailPage(
  props: PageProps<"/admin/customers/[id]">,
) {
  const { id } = await props.params;
  const customer = await getCustomerById(id);

  if (!customer) notFound();

  return <CustomerDetailClient customer={customer} />;
}
