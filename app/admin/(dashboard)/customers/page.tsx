import type { Metadata } from "next";

import {
  listCustomers,
  type CustomerStatusFilter,
  type CustomerTypeFilter,
} from "@/services/customers";
import { CustomersClient } from "@/components/admin/customers/customers-client";

export const metadata: Metadata = {
  title: "Customers",
};

export default async function CustomersPage(props: PageProps<"/admin/customers">) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const type: CustomerTypeFilter =
    searchParams.type === "guest" || searchParams.type === "registered"
      ? searchParams.type
      : "all";
  const status: CustomerStatusFilter =
    searchParams.status === "active" || searchParams.status === "disabled"
      ? searchParams.status
      : "all";
  const page = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1;

  const result = await listCustomers({ q, page, type, status, pageSize: 20 });

  return <CustomersClient result={result} q={q} type={type} status={status} />;
}
