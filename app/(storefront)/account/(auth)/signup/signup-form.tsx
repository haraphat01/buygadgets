"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { signupCustomer } from "@/actions/customer-auth";
import { signupSchema, type SignupValues } from "@/lib/validations/customer-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm({ defaultEmail }: { defaultEmail: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { firstName: "", lastName: "", email: defaultEmail, phone: "", password: "" },
  });

  function onSubmit(values: SignupValues) {
    setServerError(null);
    startTransition(async () => {
      const result = await signupCustomer(values);
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

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" aria-invalid={!!errors.firstName} {...register("firstName")} />
          {errors.firstName ? <p className="text-sm text-destructive">{errors.firstName.message}</p> : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" aria-invalid={!!errors.lastName} {...register("lastName")} />
          {errors.lastName ? <p className="text-sm text-destructive">{errors.lastName.message}</p> : null}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
        {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" {...register("phone")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
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
        {isPending ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
