"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
  clearCartCouponCode,
  ensureCartSessionId,
  getCartSessionId,
  setCartCouponCode,
} from "@/lib/cart-session";
import { validateCoupon } from "@/lib/coupon";
import { getCart } from "@/services/cart";
import type { ActionResult } from "@/types";

export async function addToCart({
  productId,
  variantId,
  quantity = 1,
}: {
  productId: string;
  variantId?: string | null;
  quantity?: number;
}): Promise<ActionResult> {
  if (quantity < 1) {
    return { success: false, error: "Quantity must be at least 1." };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, published: true, archived: true },
  });
  if (!product || !product.published || product.archived) {
    return { success: false, error: "This product isn't available." };
  }

  const sessionId = await ensureCartSessionId();

  const existing = await prisma.cartItem.findFirst({
    where: { sessionId, productId, variantId: variantId ?? null },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { sessionId, productId, variantId: variantId ?? null, quantity },
    });
  }

  revalidatePath("/cart");
  return { success: true, data: undefined };
}

export async function updateCartItemQuantity(
  id: string,
  quantity: number,
): Promise<ActionResult> {
  const sessionId = await getCartSessionId();
  if (!sessionId) return { success: false, error: "Cart not found." };

  const item = await prisma.cartItem.findFirst({ where: { id, sessionId } });
  if (!item) return { success: false, error: "Item not found in your cart." };

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id } });
  } else {
    await prisma.cartItem.update({ where: { id }, data: { quantity } });
  }

  revalidatePath("/cart");
  return { success: true, data: undefined };
}

export async function removeCartItem(id: string): Promise<ActionResult> {
  const sessionId = await getCartSessionId();
  if (!sessionId) return { success: false, error: "Cart not found." };

  const item = await prisma.cartItem.findFirst({ where: { id, sessionId } });
  if (!item) return { success: false, error: "Item not found in your cart." };

  await prisma.cartItem.delete({ where: { id } });
  revalidatePath("/cart");
  return { success: true, data: undefined };
}

export async function applyCoupon(code: string): Promise<ActionResult> {
  const trimmed = code.trim();
  if (!trimmed) {
    return { success: false, error: "Enter a coupon code." };
  }

  const coupon = await prisma.coupon.findUnique({ where: { code: trimmed } });
  if (!coupon) {
    return { success: false, error: "That coupon code doesn't exist." };
  }

  const { subtotal } = await getCart();
  const result = validateCoupon(coupon, subtotal);
  if (!result.valid) {
    return { success: false, error: result.reason };
  }

  await setCartCouponCode(coupon.code);
  revalidatePath("/cart");
  return { success: true, data: undefined };
}

export async function removeCoupon(): Promise<ActionResult> {
  await clearCartCouponCode();
  revalidatePath("/cart");
  return { success: true, data: undefined };
}
