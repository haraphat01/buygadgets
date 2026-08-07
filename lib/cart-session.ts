import "server-only";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";

const CART_SESSION_COOKIE = "cart_sid";
const CART_COUPON_COOKIE = "cart_coupon";
const ONE_YEAR = 60 * 60 * 24 * 365;

/// Read-only — safe to call from Server Components (which can't set
/// cookies). Returns null if no cart session exists yet.
export async function getCartSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_SESSION_COOKIE)?.value ?? null;
}

/// Server-Action-only (writes a cookie). Returns the existing session id
/// or creates and persists a new one.
export async function ensureCartSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CART_SESSION_COOKIE)?.value;
  if (existing) return existing;

  const sessionId = randomUUID();
  cookieStore.set(CART_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: ONE_YEAR,
    path: "/",
  });
  return sessionId;
}

export async function getCartCouponCode(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_COUPON_COOKIE)?.value ?? null;
}

export async function setCartCouponCode(code: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_COUPON_COOKIE, code, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: ONE_YEAR,
    path: "/",
  });
}

export async function clearCartCouponCode(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CART_COUPON_COOKIE);
}
