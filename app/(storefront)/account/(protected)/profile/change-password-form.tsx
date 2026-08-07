"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { changePassword } from "@/actions/customer-auth";
import { changePasswordSchema, type ChangePasswordValues } from "@/lib/validations/customer-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  function onSubmit(values: ChangePasswordValues) {
    startTransition(async () => {
      const result = await changePassword(values);
      if (result.success) {
        toast.success("Password changed.");
        reset();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.currentPassword}
          {...register("currentPassword")}
        />
        {errors.currentPassword ? (
          <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.newPassword}
          {...register("newPassword")}
        />
        {errors.newPassword ? <p className="text-xs text-destructive">{errors.newPassword.message}</p> : null}
      </div>
      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Saving..." : "Change Password"}
      </Button>
    </form>
  );
}
