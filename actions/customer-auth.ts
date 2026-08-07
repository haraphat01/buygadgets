"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { buildPasswordResetEmail, buildWelcomeEmail } from "@/lib/emails";
import {
  changePasswordSchema,
  customerLoginSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  signupSchema,
  type ChangePasswordValues,
  type CustomerLoginValues,
  type RequestPasswordResetValues,
  type ResetPasswordValues,
  type SignupValues,
} from "@/lib/validations/customer-auth";
import type { ActionResult } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function signupCustomer(values: SignupValues): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Check the form for errors." };
  }

  const existingCustomer = await prisma.customer.findUnique({ where: { email: parsed.data.email } });
  if (existingCustomer?.profileId) {
    return { success: false, error: "An account with that email already exists. Try signing in instead." };
  }

  // Auto-confirmed, privileged creation — no Supabase-delivered
  // confirmation email involved, since every email this app sends goes
  // through Resend instead.
  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });

  if (error || !data.user) {
    return { success: false, error: error?.message ?? "Could not create your account." };
  }

  await prisma.profile.create({
    data: { id: data.user.id, fullName: `${parsed.data.firstName} ${parsed.data.lastName}` },
  });

  // Converts an existing guest Customer row from a prior guest checkout
  // in-place, rather than creating a duplicate.
  await prisma.customer.upsert({
    where: { email: parsed.data.email },
    update: {
      profileId: data.user.id,
      isGuest: false,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone || undefined,
    },
    create: {
      profileId: data.user.id,
      email: parsed.data.email,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone || null,
      isGuest: false,
    },
  });

  await sendEmail({ to: parsed.data.email, ...buildWelcomeEmail({ firstName: parsed.data.firstName }) });

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (signInError) {
    return { success: false, error: "Account created — please sign in." };
  }

  redirect("/account/orders");
}

export async function loginCustomer(values: CustomerLoginValues): Promise<ActionResult> {
  const parsed = customerLoginSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Enter a valid email and password." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return { success: false, error: "Invalid email or password." };
  }

  const customer = await prisma.customer.findUnique({ where: { profileId: data.user.id } });

  if (!customer) {
    await supabase.auth.signOut();
    return { success: false, error: "This account isn't a customer account." };
  }
  if (customer.disabled) {
    await supabase.auth.signOut();
    return { success: false, error: "This account has been disabled." };
  }

  redirect("/account/orders");
}

export async function logoutCustomer(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/account/login");
}

export async function requestPasswordReset(values: RequestPasswordResetValues): Promise<ActionResult> {
  const parsed = requestPasswordResetSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Enter a valid email address." };
  }

  const customer = await prisma.customer.findUnique({ where: { email: parsed.data.email } });
  // Don't reveal whether an account exists.
  if (!customer?.profileId) {
    return { success: true, data: undefined };
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.generateLink({
    type: "recovery",
    email: parsed.data.email,
    options: { redirectTo: `${SITE_URL}/api/auth/callback?next=/account/reset-password` },
  });

  if (error || !data.properties?.action_link) {
    return { success: true, data: undefined };
  }

  await sendEmail({
    to: parsed.data.email,
    ...buildPasswordResetEmail({ resetUrl: data.properties.action_link }),
  });

  return { success: true, data: undefined };
}

export async function resetPassword(values: ResetPasswordValues): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Check the form for errors." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { success: false, error: "Could not reset your password. The link may have expired." };
  }

  redirect("/account/orders");
}

export async function changePassword(values: ChangePasswordValues): Promise<ActionResult> {
  const parsed = changePasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Check the form for errors." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return { success: false, error: "Not signed in." };
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });
  if (verifyError) {
    return { success: false, error: "Current password is incorrect." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword });
  if (error) {
    return { success: false, error: "Could not change your password." };
  }

  return { success: true, data: undefined };
}
