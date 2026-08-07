"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Printer } from "lucide-react";

import { refundOrder, updateOrderStatus } from "@/actions/orders";
import {
  ORDER_STATUSES,
  updateOrderStatusSchema,
  type UpdateOrderStatusValues,
} from "@/lib/validations/order";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { OrderStatusBadge } from "@/components/admin/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { OrderWithRelations } from "@/services/orders";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function OrderDetailClient({ order }: { order: OrderWithRelations }) {
  const [isPending, startTransition] = useTransition();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);

  const { register, handleSubmit, watch, setValue } = useForm<UpdateOrderStatusValues>({
    resolver: zodResolver(updateOrderStatusSchema),
    defaultValues: { status: order.status, trackingNumber: order.trackingNumber ?? "" },
  });

  function onSubmit(values: UpdateOrderStatusValues) {
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, values);
      if (result.success) toast.success("Order updated.");
      else toast.error(result.error);
    });
  }

  const canRefund =
    (order.status === "PAID" ||
      order.status === "PROCESSING" ||
      order.status === "SHIPPED" ||
      order.status === "DELIVERED") &&
    order.payments.some((p) => p.status === "PAID");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight">{order.orderNumber}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="size-4" />
            Print Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer & Delivery</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <p className="font-medium">
              {order.firstName} {order.lastName}
            </p>
            <p className="text-muted-foreground">{order.email}</p>
            <p className="text-muted-foreground">{order.phone}</p>
            <p className="mt-2">
              {order.address}, {order.city}, {order.state}
            </p>
            {order.orderNotes ? (
              <p className="mt-2 text-muted-foreground">Notes: {order.orderNotes}</p>
            ) : null}
            <p className="mt-2 text-muted-foreground">
              Delivery: {order.deliveryMethod?.name ?? "—"}
            </p>
            {order.trackingNumber ? (
              <p className="text-muted-foreground">Tracking: {order.trackingNumber}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment & Totals</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <p className="text-muted-foreground">
              Method: {order.paymentMethod.replace(/_/g, " ")}
            </p>
            {order.payments.map((payment) => (
              <p key={payment.id} className="text-muted-foreground">
                Payment: {payment.status} — {currency.format(Number(payment.amount))}
                {payment.reference ? ` (${payment.reference})` : ""}
              </p>
            ))}
            <div className="mt-2 flex flex-col gap-0.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{currency.format(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>{currency.format(Number(order.deliveryFee))}</span>
              </div>
              {Number(order.discount) > 0 ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Discount {order.coupon ? `(${order.coupon.code})` : ""}
                  </span>
                  <span>-{currency.format(Number(order.discount))}</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t pt-1 font-medium">
                <span>Total</span>
                <span>{currency.format(Number(order.total))}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{currency.format(Number(item.price))}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{currency.format(Number(item.subtotal))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="text-base">Update Status</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(v) => setValue("status", v as UpdateOrderStatusValues["status"])}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="trackingNumber">Tracking Number</Label>
              <Input id="trackingNumber" {...register("trackingNumber")} className="w-56" />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>

            <div className="ml-auto flex gap-2">
              {order.status !== "CANCELLED" && order.status !== "REFUNDED" ? (
                <Button type="button" variant="destructive" onClick={() => setCancelOpen(true)}>
                  Cancel Order
                </Button>
              ) : null}
              {canRefund ? (
                <Button type="button" variant="outline" onClick={() => setRefundOpen(true)}>
                  Refund
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title={`Cancel order ${order.orderNumber}?`}
        description="This restores stock for the items in this order. This can't be undone."
        confirmLabel="Cancel Order"
        onConfirm={() => updateOrderStatus(order.id, { status: "CANCELLED", trackingNumber: order.trackingNumber ?? undefined })}
      />

      <ConfirmDialog
        open={refundOpen}
        onOpenChange={setRefundOpen}
        title={`Refund order ${order.orderNumber}?`}
        description="Marks the order and its payment as refunded. This does not call Paystack — process the actual refund there separately."
        confirmLabel="Refund"
        onConfirm={() => refundOrder(order.id)}
      />
    </div>
  );
}
