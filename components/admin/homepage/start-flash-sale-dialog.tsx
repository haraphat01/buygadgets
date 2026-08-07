"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { setFlashSale } from "@/actions/homepage";
import {
  flashSaleSchema,
  type FlashSaleFormInput,
  type FlashSaleValues,
} from "@/lib/validations/flash-sale";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductPickerItem } from "@/services/homepage";

export function StartFlashSaleDialog({
  open,
  onOpenChange,
  products,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: ProductPickerItem[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a flash sale</DialogTitle>
        </DialogHeader>
        {open ? (
          <StartFlashSaleForm key="new" products={products} onOpenChange={onOpenChange} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function StartFlashSaleForm({
  products,
  onOpenChange,
}: {
  products: ProductPickerItem[];
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FlashSaleFormInput, unknown, FlashSaleValues>({
    resolver: zodResolver(flashSaleSchema),
    defaultValues: { productId: "", discountPrice: undefined, flashSaleEndsAt: "" },
  });

  const eligibleProducts = products.filter((p) => !p.flashSaleEndsAt || new Date(p.flashSaleEndsAt) <= new Date());

  function onSubmit(values: FlashSaleValues) {
    startTransition(async () => {
      const result = await setFlashSale(values);
      if (result.success) {
        toast.success("Flash sale started.");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label>Product</Label>
        <Select value={watch("productId")} onValueChange={(v) => setValue("productId", v as string)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a product" />
          </SelectTrigger>
          <SelectContent>
            {eligibleProducts.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.productId ? (
          <p className="text-sm text-destructive">{errors.productId.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="discountPrice">Sale Price (₦)</Label>
        <Input id="discountPrice" type="number" step="0.01" {...register("discountPrice")} />
        {errors.discountPrice ? (
          <p className="text-sm text-destructive">{errors.discountPrice.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="flashSaleEndsAt">Ends</Label>
        <Input id="flashSaleEndsAt" type="datetime-local" {...register("flashSaleEndsAt")} />
        {errors.flashSaleEndsAt ? (
          <p className="text-sm text-destructive">{errors.flashSaleEndsAt.message}</p>
        ) : null}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Start Sale"}
        </Button>
      </DialogFooter>
    </form>
  );
}
