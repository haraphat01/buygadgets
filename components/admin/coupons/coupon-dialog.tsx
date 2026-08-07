"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createCoupon, updateCoupon } from "@/actions/coupons";
import { couponSchema, type CouponFormInput, type CouponValues } from "@/lib/validations/coupon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type EditableCoupon = {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  expiryDate: Date | null;
  usageLimit: number | null;
  minimumSpend: number | null;
  active: boolean;
};

export function CouponDialog({
  open,
  onOpenChange,
  coupon,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon?: EditableCoupon | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{coupon ? "Edit coupon" : "New coupon"}</DialogTitle>
        </DialogHeader>
        {open ? (
          <CouponForm key={coupon?.id ?? "new"} coupon={coupon} onOpenChange={onOpenChange} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function CouponForm({
  coupon,
  onOpenChange,
}: {
  coupon?: EditableCoupon | null;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = !!coupon;
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CouponFormInput, unknown, CouponValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: coupon
      ? {
          id: coupon.id,
          code: coupon.code,
          type: coupon.type,
          value: Number(coupon.value),
          expiryDate: coupon.expiryDate ? coupon.expiryDate.toISOString().slice(0, 10) : "",
          usageLimit: coupon.usageLimit,
          minimumSpend: coupon.minimumSpend !== null ? Number(coupon.minimumSpend) : null,
          active: coupon.active,
        }
      : {
          code: "",
          type: "PERCENTAGE",
          value: 0,
          expiryDate: "",
          usageLimit: null,
          minimumSpend: null,
          active: true,
        },
  });

  const type = watch("type");

  function onSubmit(values: CouponValues) {
    startTransition(async () => {
      const result = isEdit ? await updateCoupon(values) : await createCoupon(values);
      if (result.success) {
        toast.success(isEdit ? "Coupon updated." : "Coupon created.");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="code">Code</Label>
        <Input id="code" placeholder="e.g. WELCOME10" {...register("code")} aria-invalid={!!errors.code} />
        {errors.code ? <p className="text-xs text-destructive">{errors.code.message}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Type</Label>
          <Select value={type} onValueChange={(v) => setValue("type", v as CouponValues["type"])}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERCENTAGE">Percentage</SelectItem>
              <SelectItem value="FIXED">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="value">{type === "PERCENTAGE" ? "Percent Off" : "Amount Off (₦)"}</Label>
          <Input id="value" type="number" step="0.01" {...register("value")} aria-invalid={!!errors.value} />
          {errors.value ? <p className="text-xs text-destructive">{errors.value.message}</p> : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input id="expiryDate" type="date" {...register("expiryDate")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="usageLimit">Usage Limit</Label>
          <Input
            id="usageLimit"
            type="number"
            placeholder="Unlimited"
            {...register("usageLimit")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="minimumSpend">Minimum Spend (₦)</Label>
        <Input id="minimumSpend" type="number" step="0.01" placeholder="None" {...register("minimumSpend")} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Switch checked={watch("active")} onCheckedChange={(v) => setValue("active", v)} />
        Active
      </label>

      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Coupon"}
        </Button>
      </DialogFooter>
    </form>
  );
}
