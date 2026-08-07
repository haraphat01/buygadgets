"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { requestPasswordReset } from "@/actions/customer-auth";
import {
  requestPasswordResetSchema,
  type RequestPasswordResetValues,
} from "@/lib/validations/customer-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RequestResetForm() {
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestPasswordResetValues>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(values: RequestPasswordResetValues) {
    startTransition(async () => {
      await requestPasswordReset(values);
      setSent(true);
    });
  }

  if (sent) {
    return (
      <Alert>
        <AlertDescription>
          If an account exists for that email, we&apos;ve sent a password reset link.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
        {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending ? "Sending..." : "Send Reset Link"}
      </Button>
    </form>
  );
}
