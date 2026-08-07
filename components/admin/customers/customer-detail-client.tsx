"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { deleteCustomer, toggleCustomerDisabled } from "@/actions/customers";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { OrderStatusBadge } from "@/components/admin/orders/order-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CustomerWithRelations } from "@/services/customers";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function CustomerDetailClient({ customer }: { customer: CustomerWithRelations }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleToggleDisabled() {
    startTransition(async () => {
      const result = await toggleCustomerDisabled(customer.id, !customer.disabled);
      if (!result.success) toast.error(result.error);
      else toast.success(customer.disabled ? "Customer enabled." : "Customer disabled.");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight">
            {customer.firstName} {customer.lastName}
          </h1>
          <Badge variant={customer.isGuest ? "outline" : "secondary"}>
            {customer.isGuest ? "Guest" : "Registered"}
          </Badge>
          <Badge variant={customer.disabled ? "destructive" : "default"}>
            {customer.disabled ? "Disabled" : "Active"}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={isPending} onClick={handleToggleDisabled}>
            {customer.disabled ? "Enable" : "Disable"}
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <p className="text-muted-foreground">{customer.email}</p>
            <p className="text-muted-foreground">{customer.phone ?? "No phone on file"}</p>
            <p className="mt-2 text-muted-foreground">
              Joined {new Date(customer.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Addresses</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            {customer.addresses.length === 0 ? (
              <p className="text-muted-foreground">No saved addresses.</p>
            ) : (
              customer.addresses.map((address) => (
                <div key={address.id} className="border-b pb-2 last:border-b-0 last:pb-0">
                  <p className="font-medium">
                    {address.firstName} {address.lastName}
                    {address.isDefault ? (
                      <Badge variant="secondary" className="ml-2">
                        Default
                      </Badge>
                    ) : null}
                  </p>
                  <p className="text-muted-foreground">{address.phone}</p>
                  <p className="text-muted-foreground">
                    {address.address}, {address.city}, {address.state}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order History</CardTitle>
        </CardHeader>
        <CardContent>
          {customer.orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{currency.format(Number(order.total))}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete "${customer.firstName} ${customer.lastName}"?`}
        description="Their orders are kept (unlinked from this customer). Their addresses, cart, wishlist, and reviews are permanently removed. This can't be undone."
        onConfirm={async () => {
          const result = await deleteCustomer(customer.id);
          if (result.success) router.push("/admin/customers");
          return result;
        }}
      />
    </div>
  );
}
