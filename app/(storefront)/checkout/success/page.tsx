import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MessageCircle } from "lucide-react";

import { getOrderByNumber } from "@/services/checkout";
import { formatNaira } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Order Confirmation",
};

// Looks up an order by number with no auth — must stay fully dynamic, same
// reasoning as /checkout.
export const instant = false;

export default async function CheckoutSuccessPage(props: PageProps<"/checkout/success">) {
  const searchParams = await props.searchParams;
  const orderNumber = typeof searchParams.order === "string" ? searchParams.order : "";
  if (!orderNumber) notFound();

  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  const isManualPayment = order.paymentMethod === "CREDIT_DIRECT" || order.paymentMethod === "KLUMP";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      {isManualPayment ? (
        <MessageCircle className="mx-auto size-12 text-primary" />
      ) : (
        <CheckCircle2 className="mx-auto size-12 text-primary" />
      )}

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        {isManualPayment ? "Order Received" : "Order Confirmed"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {isManualPayment
          ? "We'll follow up with you on WhatsApp once your financing is approved."
          : "Thank you for your order — we've received your payment."}
      </p>

      <Card className="mt-6 text-left">
        <CardContent className="flex flex-col gap-3 py-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order Number</span>
            <span className="font-medium">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery Method</span>
            <span>{order.deliveryMethod?.name ?? "—"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span>{order.status.replace(/_/g, " ")}</span>
          </div>
          <div className="flex flex-col gap-1 border-t pt-3 text-sm">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-muted-foreground">
                <span className="line-clamp-1">
                  {item.name} x{item.quantity}
                </span>
                <span className="shrink-0">{formatNaira(Number(item.subtotal))}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t pt-3 font-medium">
            <span>Total</span>
            <span>{formatNaira(Number(order.total))}</span>
          </div>
        </CardContent>
      </Card>

      {order.customer?.isGuest ? (
        <Card className="mt-4 text-left">
          <CardContent className="flex items-center justify-between gap-3 py-3 text-sm">
            <span className="text-muted-foreground">Want to track this order and future ones?</span>
            <Button
              size="sm"
              variant="outline"
              render={<Link href={`/account/signup?email=${encodeURIComponent(order.email)}`} />}
            >
              Create Account
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Button className="mt-6" render={<Link href="/products" />}>
        Continue Shopping
      </Button>
    </div>
  );
}
