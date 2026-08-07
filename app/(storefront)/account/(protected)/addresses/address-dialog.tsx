"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createAddress, updateAddress } from "@/actions/customer-account";
import {
  addressSchema,
  type AddressFormInput,
  type AddressValues,
} from "@/lib/validations/customer-auth";
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
import type { CustomerAddress } from "@/services/customer-account";

export function AddressDialog({
  open,
  onOpenChange,
  address,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: CustomerAddress | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{address ? "Edit address" : "New address"}</DialogTitle>
        </DialogHeader>
        {open ? (
          <AddressForm key={address?.id ?? "new"} address={address} onOpenChange={onOpenChange} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function AddressForm({
  address,
  onOpenChange,
}: {
  address?: CustomerAddress | null;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = !!address;
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddressFormInput, unknown, AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: address
      ? {
          id: address.id,
          label: address.label ?? "",
          firstName: address.firstName,
          lastName: address.lastName,
          phone: address.phone,
          state: address.state,
          city: address.city,
          address: address.address,
          isDefault: address.isDefault,
        }
      : {
          label: "",
          firstName: "",
          lastName: "",
          phone: "",
          state: "",
          city: "",
          address: "",
          isDefault: false,
        },
  });

  function onSubmit(values: AddressValues) {
    startTransition(async () => {
      const result = isEdit ? await updateAddress(values) : await createAddress(values);
      if (result.success) {
        toast.success(isEdit ? "Address updated." : "Address added.");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="label">Label (optional)</Label>
        <Input id="label" placeholder="e.g. Home, Office" {...register("label")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" aria-invalid={!!errors.firstName} {...register("firstName")} />
          {errors.firstName ? <p className="text-xs text-destructive">{errors.firstName.message}</p> : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" aria-invalid={!!errors.lastName} {...register("lastName")} />
          {errors.lastName ? <p className="text-xs text-destructive">{errors.lastName.message}</p> : null}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" aria-invalid={!!errors.phone} {...register("phone")} />
        {errors.phone ? <p className="text-xs text-destructive">{errors.phone.message}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="state">State</Label>
          <Input id="state" aria-invalid={!!errors.state} {...register("state")} />
          {errors.state ? <p className="text-xs text-destructive">{errors.state.message}</p> : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" aria-invalid={!!errors.city} {...register("city")} />
          {errors.city ? <p className="text-xs text-destructive">{errors.city.message}</p> : null}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address">Address</Label>
        <Input id="address" aria-invalid={!!errors.address} {...register("address")} />
        {errors.address ? <p className="text-xs text-destructive">{errors.address.message}</p> : null}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Switch checked={watch("isDefault")} onCheckedChange={(v) => setValue("isDefault", v)} />
        Set as default address
      </label>

      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : isEdit ? "Save Changes" : "Add Address"}
        </Button>
      </DialogFooter>
    </form>
  );
}
