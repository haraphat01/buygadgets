"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { adjustStock } from "@/actions/inventory";
import {
  adjustStockSchema,
  type AdjustStockFormInput,
  type AdjustStockValues,
} from "@/lib/validations/inventory";
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
import { Textarea } from "@/components/ui/textarea";
import type { InventoryListItem } from "@/services/inventory";

export function AdjustStockDialog({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryListItem | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock — {item?.name}</DialogTitle>
        </DialogHeader>
        {/* Remounted (via key) each time a different product is opened, so
            form state starts fresh without a reset effect. */}
        {open && item ? (
          <AdjustStockForm key={item.id} item={item} onOpenChange={onOpenChange} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function AdjustStockForm({
  item,
  onOpenChange,
}: {
  item: InventoryListItem;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdjustStockFormInput, unknown, AdjustStockValues>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: {
      productId: item.id,
      newQuantity: item.quantity,
      threshold: item.threshold,
      reason: "",
    },
  });

  function onSubmit(values: AdjustStockValues) {
    startTransition(async () => {
      const result = await adjustStock(values);
      if (result.success) {
        toast.success("Stock updated.");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
      <input type="hidden" {...register("productId")} />
      <p className="text-sm text-muted-foreground">Current quantity: {item.quantity}</p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newQuantity">New Quantity</Label>
        <Input id="newQuantity" type="number" {...register("newQuantity")} />
        {errors.newQuantity ? (
          <p className="text-sm text-destructive">{errors.newQuantity.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="threshold">Low Stock Threshold</Label>
        <Input id="threshold" type="number" {...register("threshold")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reason">Reason (optional)</Label>
        <Textarea
          id="reason"
          rows={3}
          placeholder="e.g. Restock delivery, damaged units, stock count correction"
          {...register("reason")}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}
