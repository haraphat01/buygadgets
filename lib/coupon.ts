import type { Coupon } from "@/generated/prisma/client";

export function validateCoupon(
  coupon: Coupon,
  subtotal: number,
): { valid: true } | { valid: false; reason: string } {
  if (!coupon.active) return { valid: false, reason: "This coupon is no longer active." };
  if (coupon.expiryDate && coupon.expiryDate < new Date()) {
    return { valid: false, reason: "This coupon has expired." };
  }
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, reason: "This coupon has reached its usage limit." };
  }
  if (coupon.minimumSpend && subtotal < Number(coupon.minimumSpend)) {
    return {
      valid: false,
      reason: `This coupon requires a minimum spend of ₦${Number(coupon.minimumSpend).toLocaleString()}.`,
    };
  }
  return { valid: true };
}

export function computeCouponDiscount(coupon: Coupon, subtotal: number): number {
  const discount =
    coupon.type === "PERCENTAGE" ? subtotal * (Number(coupon.value) / 100) : Number(coupon.value);
  return Math.min(discount, subtotal);
}
