"use server";

import { revalidatePath } from "next/cache";

import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";

export async function toggleCustomerDisabled(
  id: string,
  disabled: boolean,
): Promise<ActionResult> {
  await getAdminSession();
  await prisma.customer.update({ where: { id }, data: { disabled } });
  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${id}`);
  return { success: true, data: undefined };
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  await getAdminSession();
  await prisma.customer.delete({ where: { id } });
  revalidatePath("/admin/customers");
  return { success: true, data: undefined };
}
