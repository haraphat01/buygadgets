"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { updatePaymentSettings } from "@/actions/settings";
import {
  paymentSettingsSchema,
  type PaymentSettingsFormInput,
  type PaymentSettingsValues,
} from "@/lib/validations/payment-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export function PaymentSettingsForm({
  values,
  hasSecretKey,
}: {
  values: PaymentSettingsValues;
  hasSecretKey: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, watch, setValue } = useForm<
    PaymentSettingsFormInput,
    unknown,
    PaymentSettingsValues
  >({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: values,
  });

  function onSubmit(formValues: PaymentSettingsValues) {
    startTransition(async () => {
      const result = await updatePaymentSettings(formValues);
      if (result.success) {
        toast.success("Payment settings saved.");
        setValue("paystack.secretKey", "");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Payment Settings</h1>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Paystack</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="paystack-public">Public Key</Label>
            <Input id="paystack-public" {...register("paystack.publicKey")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="paystack-secret">Secret Key</Label>
            <Input
              id="paystack-secret"
              type="password"
              placeholder={hasSecretKey ? "•••••••••••• (saved — leave blank to keep)" : "Not set"}
              {...register("paystack.secretKey")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Credit Direct</CardTitle>
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={watch("creditDirect.enabled")}
              onCheckedChange={(v) => setValue("creditDirect.enabled", v)}
            />
            Enabled
          </label>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cd-whatsapp">WhatsApp Number</Label>
            <Input id="cd-whatsapp" placeholder="e.g. 2348012345678" {...register("creditDirect.whatsappNumber")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cd-popup">Popup Message</Label>
            <Textarea id="cd-popup" rows={4} {...register("creditDirect.popupMessage")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Klump</CardTitle>
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={watch("klump.enabled")}
              onCheckedChange={(v) => setValue("klump.enabled", v)}
            />
            Enabled
          </label>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="klump-whatsapp">WhatsApp Number</Label>
            <Input id="klump-whatsapp" placeholder="e.g. 2348012345678" {...register("klump.whatsappNumber")} />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
