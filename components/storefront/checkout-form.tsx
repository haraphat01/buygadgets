"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { placeOrder } from "@/actions/checkout";
import type { DeliveryMethod } from "@/generated/prisma/client";
import { checkoutSchema, type CheckoutValues } from "@/lib/validations/checkout";
import type { PaymentSettingsValues } from "@/lib/validations/payment-settings";
import { formatNaira } from "@/lib/currency";
import type { Cart } from "@/services/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreditKlumpDialog } from "@/components/storefront/credit-klump-dialog";

const DELIVERY_TYPE_LABEL: Record<DeliveryMethod["type"], string> = {
  BUYGADGETS: "BuyGadgets Delivery",
  GIG_LOGISTICS: "GIG Logistics",
  PICKUP: "Store Pickup",
};

type CheckoutPrefill = Pick<
  CheckoutValues,
  "firstName" | "lastName" | "phone" | "email" | "state" | "city" | "address"
>;

export function CheckoutForm({
  cart,
  deliveryMethods,
  paymentSettings,
  prefill,
}: {
  cart: Cart;
  deliveryMethods: DeliveryMethod[];
  paymentSettings: PaymentSettingsValues;
  prefill: CheckoutPrefill | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogMethod, setDialogMethod] = useState<"CREDIT_DIRECT" | "KLUMP" | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutValues, unknown, CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: prefill?.firstName ?? "",
      lastName: prefill?.lastName ?? "",
      phone: prefill?.phone ?? "",
      email: prefill?.email ?? "",
      state: prefill?.state ?? "",
      city: prefill?.city ?? "",
      address: prefill?.address ?? "",
      orderNotes: "",
      deliveryMethodId: deliveryMethods[0]?.id ?? "",
      paymentMethod: "PAYSTACK",
    },
  });

  const selectedDeliveryId = watch("deliveryMethodId");
  const paymentMethod = watch("paymentMethod");
  const selectedDelivery = deliveryMethods.find((m) => m.id === selectedDeliveryId);
  const deliveryFee = selectedDelivery ? Number(selectedDelivery.fee) : 0;
  const grandTotal = Math.max(0, cart.subtotal - cart.discount) + deliveryFee;

  const paymentOptions: { value: CheckoutValues["paymentMethod"]; label: string; available: boolean }[] = [
    { value: "PAYSTACK", label: "Pay with Paystack", available: true },
    { value: "CREDIT_DIRECT", label: "Credit Direct (Buy Now, Pay Later)", available: paymentSettings.creditDirect.enabled },
    { value: "KLUMP", label: "Klump", available: paymentSettings.klump.enabled },
  ];

  function onSubmit(values: CheckoutValues) {
    if (values.paymentMethod !== "PAYSTACK") {
      setDialogMethod(values.paymentMethod);
      return;
    }

    startTransition(async () => {
      const result = await placeOrder(values);
      // A successful Paystack submission redirect()s server-side and never
      // returns here — reaching this branch means it failed.
      if (!result.success) toast.error(result.error);
    });
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3" noValidate>
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact & Delivery Address</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...register("firstName")} aria-invalid={!!errors.firstName} />
                {errors.firstName ? <p className="text-xs text-destructive">{errors.firstName.message}</p> : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...register("lastName")} aria-invalid={!!errors.lastName} />
                {errors.lastName ? <p className="text-xs text-destructive">{errors.lastName.message}</p> : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} aria-invalid={!!errors.phone} />
                {errors.phone ? <p className="text-xs text-destructive">{errors.phone.message}</p> : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
                {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="state">State</Label>
                <Input id="state" {...register("state")} aria-invalid={!!errors.state} />
                {errors.state ? <p className="text-xs text-destructive">{errors.state.message}</p> : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register("city")} aria-invalid={!!errors.city} />
                {errors.city ? <p className="text-xs text-destructive">{errors.city.message}</p> : null}
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...register("address")} aria-invalid={!!errors.address} />
                {errors.address ? <p className="text-xs text-destructive">{errors.address.message}</p> : null}
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="orderNotes">Order Notes (optional)</Label>
                <Textarea id="orderNotes" rows={3} {...register("orderNotes")} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Delivery Method</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {deliveryMethods.length === 0 ? (
                <p className="text-sm text-muted-foreground">No delivery methods are available right now.</p>
              ) : (
                deliveryMethods.map((method) => (
                  <label
                    key={method.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-muted/40"
                  >
                    <input
                      type="radio"
                      value={method.id}
                      className="mt-0.5"
                      {...register("deliveryMethodId")}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{DELIVERY_TYPE_LABEL[method.type] ?? method.name}</span>
                        <span>{Number(method.fee) === 0 ? "Free" : formatNaira(Number(method.fee))}</span>
                      </div>
                      {method.estimatedDays ? (
                        <p className="text-xs text-muted-foreground">{method.estimatedDays}</p>
                      ) : null}
                      {method.type === "PICKUP" ? (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {method.pickupAddress ? <p>{method.pickupAddress}</p> : null}
                          {method.businessHours ? <p>{method.businessHours}</p> : null}
                        </div>
                      ) : null}
                    </div>
                  </label>
                ))
              )}
              {errors.deliveryMethodId ? (
                <p className="text-xs text-destructive">{errors.deliveryMethodId.message}</p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {paymentOptions
                .filter((option) => option.available)
                .map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-muted/40"
                  >
                    <input type="radio" value={option.value} {...register("paymentMethod")} />
                    <span className="font-medium">{option.label}</span>
                  </label>
                ))}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardContent className="flex flex-col gap-4 py-4">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <div className="flex flex-col gap-1.5 text-sm">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-muted-foreground">
                  <span className="line-clamp-1">
                    {item.name}
                    {item.variantName ? ` (${item.variantName})` : ""} x{item.quantity}
                  </span>
                  <span className="shrink-0">{formatNaira(item.lineTotal)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-1.5">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatNaira(cart.subtotal)}</span>
              </div>
              {cart.coupon ? (
                <div className="flex justify-between text-muted-foreground">
                  <span>Discount ({cart.coupon.code})</span>
                  <span>-{formatNaira(cart.discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>{deliveryFee === 0 ? "Free" : formatNaira(deliveryFee)}</span>
              </div>
              <div className="flex justify-between border-t pt-1.5 font-medium">
                <span>Total</span>
                <span>{formatNaira(grandTotal)}</span>
              </div>
            </div>

            {paymentMethod === "PAYSTACK" ? (
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Redirecting..." : "Pay with Paystack"}
              </Button>
            ) : (
              <Button type="submit" className="w-full">
                Continue
              </Button>
            )}
          </CardContent>
        </Card>
      </form>

      <CreditKlumpDialog
        open={dialogMethod !== null}
        method={dialogMethod}
        popupMessage={paymentSettings.creditDirect.popupMessage ?? ""}
        onOpenChange={(open) => {
          if (!open) setDialogMethod(null);
        }}
        onConfirm={() => {
          const values = { ...watch(), paymentMethod: dialogMethod! } as CheckoutValues;
          startTransition(async () => {
            const result = await placeOrder(values);
            if (!result.success) {
              toast.error(result.error);
              setDialogMethod(null);
              return;
            }
            if (result.data.whatsappUrl) {
              window.open(result.data.whatsappUrl, "_blank", "noopener,noreferrer");
            }
            setDialogMethod(null);
            router.push(`/checkout/success?order=${result.data.orderNumber}`);
          });
        }}
        isPending={isPending}
      />
    </>
  );
}
