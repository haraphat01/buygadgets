import type { Metadata } from "next";
import Link from "next/link";

import { getCustomerSession } from "@/lib/customer-auth";
import { getCustomerOrders } from "@/services/customer-account";
import { formatNaira } from "@/lib/currency";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/admin/orders/order-status-badge";

export const metadata: Metadata = {
  title: "Your Orders",
};

export default async function AccountOrdersPage() {
  const session = await getCustomerSession();
  const orders = await getCustomerOrders(session.customer.id);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold tracking-tight">Your Orders</h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            You haven&apos;t placed any orders yet.
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link href={`/account/orders/${order.id}`} className="font-medium hover:underline">
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{formatNaira(Number(order.total))}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
