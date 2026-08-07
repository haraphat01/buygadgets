"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/admin/orders/order-status-badge";
import { ORDER_STATUSES } from "@/lib/validations/order";
import type { OrderListItem, OrderStatusFilter } from "@/services/orders";
import type { PaginatedResult } from "@/types";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function OrdersClient({
  result,
  q,
  status,
}: {
  result: PaginatedResult<OrderListItem>;
  q: string;
  status: OrderStatusFilter;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(q);

  function updateParams(patch: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search !== q) updateParams({ q: search || undefined, page: undefined });
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold tracking-tight">Orders</h1>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search by order #, name, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={status}
          onValueChange={(value) =>
            updateParams({ status: value === "all" ? undefined : (value as string), page: undefined })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              result.items.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {order.firstName} {order.lastName}
                    <div className="text-xs text-muted-foreground">{order.email}</div>
                  </TableCell>
                  <TableCell>{currency.format(Number(order.total))}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.paymentMethod.replace(/_/g, " ")}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Page {result.page} of {result.totalPages} ({result.total} orders)
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={result.page <= 1}
            onClick={() => updateParams({ page: String(result.page - 1) })}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={result.page >= result.totalPages}
            onClick={() => updateParams({ page: String(result.page + 1) })}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
