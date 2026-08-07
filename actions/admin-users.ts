"use server";

import { revalidatePath } from "next/cache";

import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ASSIGNABLE_ROLES,
  createAdminUserSchema,
  type CreateAdminUserValues,
} from "@/lib/validations/admin-user";
import type { ActionResult } from "@/types";

async function requireOwner() {
  const session = await getAdminSession();
  if (session.adminUser.role !== "OWNER") {
    return null;
  }
  return session;
}

export async function createAdminUser(
  values: CreateAdminUserValues,
): Promise<ActionResult> {
  const session = await requireOwner();
  if (!session) {
    return { success: false, error: "Only the Owner can manage admin accounts." };
  }

  const parsed = createAdminUserSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Check the form for errors." };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });

  if (error || !data.user) {
    return { success: false, error: error?.message ?? "Could not create the account." };
  }

  await prisma.profile.create({
    data: { id: data.user.id, fullName: parsed.data.fullName },
  });
  await prisma.adminUser.create({
    data: { profileId: data.user.id, role: parsed.data.role },
  });

  revalidatePath("/admin/users");
  return { success: true, data: undefined };
}

export async function updateAdminUserRole(
  id: string,
  role: (typeof ASSIGNABLE_ROLES)[number],
): Promise<ActionResult> {
  const session = await requireOwner();
  if (!session) {
    return { success: false, error: "Only the Owner can manage admin accounts." };
  }

  if (!ASSIGNABLE_ROLES.includes(role)) {
    return { success: false, error: "Invalid role." };
  }

  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (!target) {
    return { success: false, error: "Admin user not found." };
  }
  if (target.role === "OWNER") {
    return { success: false, error: "The Owner's role can't be changed here." };
  }

  await prisma.adminUser.update({ where: { id }, data: { role } });
  revalidatePath("/admin/users");
  return { success: true, data: undefined };
}

export async function deleteAdminUser(id: string): Promise<ActionResult> {
  const session = await requireOwner();
  if (!session) {
    return { success: false, error: "Only the Owner can manage admin accounts." };
  }

  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (!target) {
    return { success: false, error: "Admin user not found." };
  }
  if (target.role === "OWNER") {
    return { success: false, error: "The Owner account can't be deleted here." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(target.profileId);
  if (error) {
    return { success: false, error: error.message };
  }

  await prisma.profile.delete({ where: { id: target.profileId } });

  revalidatePath("/admin/users");
  return { success: true, data: undefined };
}
