import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCustomerSession } from "@/lib/customer-auth";
import { getCustomerOrderById } from "@/services/customer-account";
import { formatNaira } from "@/lib/currency";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/admin/orders/order-status-badge";

export const metadata: Metadata = {
  title: "Order Details",
};

export default async function AccountOrderDetailPage(props: PageProps<"/account/orders/[id]">) {
  const { id } = await props.params;
  const session = await getCustomerSession();
  const order = await getCustomerOrderById(session.customer.id, id);

  if (!order) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">{order.orderNumber}</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 py-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Placed</span>
            <span>{new Date(order.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Method</span>
            <span>{order.deliveryMethod?.name ?? "—"}</span>
          </div>
          {order.trackingNumber ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tracking Number</span>
              <span>{order.trackingNumber}</span>
            </div>
          ) : null}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Address</span>
            <span className="text-right">
              {order.address}, {order.city}, {order.state}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-2 py-4 text-sm">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-muted-foreground">
              <span>
                {item.name} x{item.quantity}
              </span>
              <span className="text-foreground">{formatNaira(Number(item.subtotal))}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t pt-2 font-medium">
            <span>Total</span>
            <span>{formatNaira(Number(order.total))}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
