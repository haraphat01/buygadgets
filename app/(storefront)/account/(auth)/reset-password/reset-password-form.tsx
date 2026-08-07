"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { resetPassword } from "@/actions/customer-auth";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validations/customer-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "" },
  });

  function onSubmit(values: ResetPasswordValues) {
    setServerError(null);
    startTransition(async () => {
      const result = await resetPassword(values);
      if (!result.success) setServerError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {serverError ? (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending ? "Saving..." : "Set Password"}
      </Button>
    </form>
  );
}
