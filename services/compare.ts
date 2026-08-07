import "server-only";

import { prisma } from "@/lib/prisma";
import { getCartSessionId } from "@/lib/cart-session";
import { serializeProduct } from "@/lib/serialize-product";

export const MAX_COMPARE_ITEMS = 2;

/// Compare shares the same guest-session cookie as the cart (CompareItem
/// and CartItem have identical sessionId/customerId shape in the schema —
/// both are the same per-visitor guest session, not separate concepts).
export async function getCompareProductIds(): Promise<string[]> {
  const sessionId = await getCartSessionId();
  if (!sessionId) return [];

  const items = await prisma.compareItem.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
    select: { productId: true },
  });
  return items.map((item) => item.productId);
}

export async function getCompareProducts() {
  const productIds = await getCompareProductIds();
  if (productIds.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: {
      brand: { select: { name: true } },
      images: { orderBy: { position: "asc" }, take: 1 },
    },
  });

  // Preserve the order items were added in, not Prisma's `in` order.
  const byId = new Map(products.map((p) => [p.id, p]));
  return productIds.map((id) => byId.get(id)).filter((p) => p !== undefined).map(serializeProduct);
}

export type CompareProduct = Awaited<ReturnType<typeof getCompareProducts>>[number];
