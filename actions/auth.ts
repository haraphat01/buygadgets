"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";
import type { ActionResult } from "@/types";

export async function loginAdmin(
  values: LoginValues,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Enter a valid email and password." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(
    parsed.data,
  );

  if (error || !data.user) {
    return { success: false, error: "Invalid email or password." };
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: { profileId: data.user.id },
  });

  if (!adminUser) {
    await supabase.auth.signOut();
    return { success: false, error: "This account isn't an admin account." };
  }

  redirect("/admin");
}

export async function logoutAdmin(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
