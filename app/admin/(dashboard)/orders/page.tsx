import type { Metadata } from "next";

import { listOrders, type OrderStatusFilter } from "@/services/orders";
import { ORDER_STATUSES } from "@/lib/validations/order";
import { OrdersClient } from "@/components/admin/orders/orders-client";

export const metadata: Metadata = {
  title: "Orders",
};

export default async function OrdersPage(props: PageProps<"/admin/orders">) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const statusParam = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const status: OrderStatusFilter =
    statusParam && (ORDER_STATUSES as readonly string[]).includes(statusParam)
      ? (statusParam as OrderStatusFilter)
      : "all";
  const page = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1;

  const result = await listOrders({ q, page, status, pageSize: 20 });

  return <OrdersClient result={result} q={q} status={status} />;
}
