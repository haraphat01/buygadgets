"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { applyCoupon, removeCartItem, removeCoupon, updateCartItemQuantity } from "@/actions/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatNaira } from "@/lib/currency";
import type { Cart } from "@/services/cart";

export function CartView({ cart }: { cart: Cart }) {
  const [isPending, startTransition] = useTransition();
  const [couponInput, setCouponInput] = useState("");
  const [couponPending, startCouponTransition] = useTransition();

  function handleQuantityChange(id: string, quantity: number) {
    startTransition(async () => {
      const result = await updateCartItemQuantity(id, quantity);
      if (!result.success) toast.error(result.error);
    });
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      const result = await removeCartItem(id);
      if (!result.success) toast.error(result.error);
    });
  }

  function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    startCouponTransition(async () => {
      const result = await applyCoupon(couponInput);
      if (result.success) {
        toast.success("Coupon applied.");
        setCouponInput("");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleRemoveCoupon() {
    startCouponTransition(async () => {
      await removeCoupon();
    });
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Browse the shop to find something you like.</p>
        <Button className="mt-4" render={<Link href="/products" />}>
          Shop Products
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-6 lg:grid-cols-3">
      <div className="flex flex-col gap-3 lg:col-span-2">
        <h1 className="text-2xl font-semibold tracking-tight">Your Cart</h1>
        {cart.items.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-center gap-4 py-3">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                {item.image ? (
                  <Image src={item.image} alt={item.name} width={64} height={64} className="size-full object-cover" />
                ) : null}
              </div>
              <div className="flex-1">
                <Link href={`/products/${item.slug}`} className="text-sm font-medium hover:underline">
                  {item.name}
                </Link>
                {item.variantName ? (
                  <p className="text-xs text-muted-foreground">{item.variantName}</p>
                ) : null}
                <p className="mt-1 text-sm text-muted-foreground">{formatNaira(item.unitPrice)}</p>
              </div>
              <div className="flex items-center rounded-lg border">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={isPending}
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                >
                  <Minus className="size-3" />
                </Button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={isPending}
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                >
                  <Plus className="size-3" />
                </Button>
              </div>
              <p className="w-24 text-right text-sm font-medium">{formatNaira(item.lineTotal)}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={isPending}
                onClick={() => handleRemove(item.id)}
              >
                <X className="size-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="h-fit">
        <CardContent className="flex flex-col gap-4 py-4">
          <h2 className="text-lg font-semibold">Order Summary</h2>

          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatNaira(cart.subtotal)}</span>
            </div>
            {cart.coupon ? (
              <div className="flex justify-between text-muted-foreground">
                <span>Discount ({cart.coupon.code})</span>
                <span>-{formatNaira(cart.discount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t pt-1.5 font-medium">
              <span>Total</span>
              <span>{formatNaira(cart.total)}</span>
            </div>
          </div>

          {cart.coupon ? (
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm">
              <span>Coupon &quot;{cart.coupon.code}&quot; applied</span>
              <Button variant="ghost" size="sm" disabled={couponPending} onClick={handleRemoveCoupon}>
                Remove
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Coupon code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
              />
              <Button type="button" variant="outline" disabled={couponPending} onClick={handleApplyCoupon}>
                Apply
              </Button>
            </div>
          )}

          <Button className="w-full" render={<Link href="/checkout" />}>
            Proceed to Checkout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
