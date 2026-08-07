"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { updateProfile } from "@/actions/customer-account";
import { updateProfileSchema, type UpdateProfileValues } from "@/lib/validations/customer-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({ defaultValues }: { defaultValues: UpdateProfileValues }) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues,
  });

  function onSubmit(values: UpdateProfileValues) {
    startTransition(async () => {
      const result = await updateProfile(values);
      if (result.success) toast.success("Profile updated.");
      else toast.error(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
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
        <Input id="phone" {...register("phone")} />
      </div>
      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
