"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { updateDeliveryMethods } from "@/actions/delivery";
import {
  deliveryMethodsSchema,
  type DeliveryMethodsFormInput,
  type DeliveryMethodsValues,
} from "@/lib/validations/delivery";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { getDeliveryMethods } from "@/services/delivery";

export function DeliverySettingsForm({
  methods,
}: {
  methods: Awaited<ReturnType<typeof getDeliveryMethods>>;
}) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DeliveryMethodsFormInput, unknown, DeliveryMethodsValues>({
    resolver: zodResolver(deliveryMethodsSchema),
    defaultValues: {
      buygadgets: {
        fee: Number(methods.buygadgets.fee),
        estimatedDays: methods.buygadgets.estimatedDays ?? "",
        active: methods.buygadgets.active,
      },
      gig: {
        fee: Number(methods.gig.fee),
        estimatedDays: methods.gig.estimatedDays ?? "",
        active: methods.gig.active,
      },
      pickup: {
        address: methods.pickup.pickupAddress ?? "",
        businessHours: methods.pickup.businessHours ?? "",
        active: methods.pickup.active,
      },
    },
  });

  function onSubmit(values: DeliveryMethodsValues) {
    startTransition(async () => {
      const result = await updateDeliveryMethods(values);
      if (result.success) {
        toast.success("Delivery settings saved.");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Delivery Settings</h1>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">BuyGadgets Delivery</CardTitle>
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={watch("buygadgets.active")}
              onCheckedChange={(v) => setValue("buygadgets.active", v)}
            />
            Active
          </label>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bg-fee">Delivery Fee (₦)</Label>
            <Input id="bg-fee" type="number" step="0.01" {...register("buygadgets.fee")} />
            {errors.buygadgets?.fee ? (
              <p className="text-sm text-destructive">{errors.buygadgets.fee.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bg-days">Estimated Days</Label>
            <Input id="bg-days" placeholder="e.g. 2-4 business days" {...register("buygadgets.estimatedDays")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">GIG Logistics</CardTitle>
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={watch("gig.active")}
              onCheckedChange={(v) => setValue("gig.active", v)}
            />
            Active
          </label>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="gig-fee">Delivery Fee (₦)</Label>
            <Input id="gig-fee" type="number" step="0.01" {...register("gig.fee")} />
            {errors.gig?.fee ? (
              <p className="text-sm text-destructive">{errors.gig.fee.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="gig-days">Estimated Days</Label>
            <Input id="gig-days" placeholder="e.g. 3-5 business days" {...register("gig.estimatedDays")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Pickup in Store</CardTitle>
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={watch("pickup.active")}
              onCheckedChange={(v) => setValue("pickup.active", v)}
            />
            Active
          </label>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Fee</Label>
            <Input value="₦0 (fixed)" disabled />
          </div>
          <div />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pickup-address">Address</Label>
            <Input id="pickup-address" {...register("pickup.address")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pickup-hours">Business Hours</Label>
            <Input id="pickup-hours" placeholder="e.g. Mon-Sat, 9am-6pm" {...register("pickup.businessHours")} />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
