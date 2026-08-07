"use server";

import { revalidatePath } from "next/cache";

import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import {
  addressSchema,
  updateProfileSchema,
  type AddressValues,
  type UpdateProfileValues,
} from "@/lib/validations/customer-auth";
import type { ActionResult } from "@/types";

export async function updateProfile(values: UpdateProfileValues): Promise<ActionResult> {
  const session = await getCustomerSession();
  const parsed = updateProfileSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Check the form for errors." };
  }

  await prisma.customer.update({
    where: { id: session.customer.id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone || null,
    },
  });

  if (session.customer.profileId) {
    await prisma.profile.update({
      where: { id: session.customer.profileId },
      data: { fullName: `${parsed.data.firstName} ${parsed.data.lastName}`, phone: parsed.data.phone || null },
    });
  }

  revalidatePath("/account/profile");
  return { success: true, data: undefined };
}

export async function createAddress(values: AddressValues): Promise<ActionResult> {
  const session = await getCustomerSession();
  const parsed = addressSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Check the form for errors." };
  }

  await prisma.$transaction(async (tx) => {
    if (parsed.data.isDefault) {
      await tx.address.updateMany({ where: { customerId: session.customer.id }, data: { isDefault: false } });
    }
    await tx.address.create({
      data: {
        customerId: session.customer.id,
        label: parsed.data.label || null,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone,
        state: parsed.data.state,
        city: parsed.data.city,
        address: parsed.data.address,
        isDefault: parsed.data.isDefault,
      },
    });
  });

  revalidatePath("/account/addresses");
  return { success: true, data: undefined };
}

export async function updateAddress(values: AddressValues): Promise<ActionResult> {
  const session = await getCustomerSession();
  const parsed = addressSchema.safeParse(values);
  if (!parsed.success || !parsed.data.id) {
    return { success: false, error: "Check the form for errors." };
  }

  const existing = await prisma.address.findFirst({
    where: { id: parsed.data.id, customerId: session.customer.id },
  });
  if (!existing) {
    return { success: false, error: "Address not found." };
  }

  await prisma.$transaction(async (tx) => {
    if (parsed.data.isDefault) {
      await tx.address.updateMany({ where: { customerId: session.customer.id }, data: { isDefault: false } });
    }
    await tx.address.update({
      where: { id: parsed.data.id },
      data: {
        label: parsed.data.label || null,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone,
        state: parsed.data.state,
        city: parsed.data.city,
        address: parsed.data.address,
        isDefault: parsed.data.isDefault,
      },
    });
  });

  revalidatePath("/account/addresses");
  return { success: true, data: undefined };
}

export async function deleteAddress(id: string): Promise<ActionResult> {
  const session = await getCustomerSession();
  await prisma.address.deleteMany({ where: { id, customerId: session.customer.id } });
  revalidatePath("/account/addresses");
  return { success: true, data: undefined };
}
