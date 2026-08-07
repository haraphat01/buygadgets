import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getOrderById } from "@/services/orders";
import { OrderDetailClient } from "@/components/admin/orders/order-detail-client";

export const metadata: Metadata = {
  title: "Order Detail",
};

export default async function OrderDetailPage(props: PageProps<"/admin/orders/[id]">) {
  const { id } = await props.params;
  const order = await getOrderById(id);

  if (!order) notFound();

  return <OrderDetailClient order={order} />;
}
