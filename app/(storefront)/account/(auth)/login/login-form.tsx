"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginCustomer } from "@/actions/customer-auth";
import { customerLoginSchema, type CustomerLoginValues } from "@/lib/validations/customer-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerLoginValues>({
    resolver: zodResolver(customerLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: CustomerLoginValues) {
    setServerError(null);
    startTransition(async () => {
      const result = await loginCustomer(values);
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
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
        {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
