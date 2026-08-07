import "server-only";

import { prisma } from "@/lib/prisma";
import { getCartCouponCode, getCartSessionId } from "@/lib/cart-session";
import { computeCouponDiscount, validateCoupon } from "@/lib/coupon";

/// Private, per-visitor data — deliberately not "use cache" (unlike the
/// home/product pages), same category as admin reads. Reads the session
/// cookie, so anything calling this is a runtime/dynamic component.
export async function getCart() {
  const sessionId = await getCartSessionId();

  if (!sessionId) {
    return { items: [], subtotal: 0, discount: 0, total: 0, coupon: null, itemCount: 0 };
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { sessionId },
    include: {
      product: {
        include: { images: { orderBy: { position: "asc" }, take: 1 } },
      },
      variant: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const items = cartItems.map((item) => {
    const unitPrice = item.variant?.price
      ? Number(item.variant.price)
      : item.product.discountPrice
        ? Number(item.product.discountPrice)
        : Number(item.product.price);

    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      slug: item.product.slug,
      name: item.product.name,
      variantName: item.variant?.name ?? null,
      image: item.product.images[0]?.url ?? null,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const couponCode = await getCartCouponCode();
  let coupon: { code: string } | null = null;
  let discount = 0;

  if (couponCode) {
    const couponRow = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (couponRow && validateCoupon(couponRow, subtotal).valid) {
      discount = computeCouponDiscount(couponRow, subtotal);
      coupon = { code: couponRow.code };
    }
  }

  return {
    items,
    subtotal,
    discount,
    total: Math.max(0, subtotal - discount),
    coupon,
    itemCount,
  };
}

export type Cart = Awaited<ReturnType<typeof getCart>>;

export async function getCartItemCount(): Promise<number> {
  const sessionId = await getCartSessionId();
  if (!sessionId) return 0;
  const result = await prisma.cartItem.aggregate({
    where: { sessionId },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
}
