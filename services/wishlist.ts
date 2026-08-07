import "server-only";

import { prisma } from "@/lib/prisma";
import { getOptionalCustomerSession } from "@/lib/customer-auth";
import { serializeProduct } from "@/lib/serialize-product";

/// Returns [] for anonymous visitors rather than redirecting — used by
/// read-only contexts like the header badge and the purchase panel's
/// button state, which need to render for logged-out visitors too.
export async function getWishlistProductIds(): Promise<string[]> {
  const session = await getOptionalCustomerSession();
  if (!session) return [];

  const items = await prisma.wishlist.findMany({
    where: { customerId: session.customer.id },
    orderBy: { createdAt: "desc" },
    select: { productId: true },
  });
  return items.map((item) => item.productId);
}

export async function getWishlistProducts(customerId: string) {
  const items = await prisma.wishlist.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: { brand: { select: { name: true } }, images: { orderBy: { position: "asc" }, take: 1 } },
      },
    },
  });
  return items.map((item) => serializeProduct(item.product));
}

export type WishlistProduct = Awaited<ReturnType<typeof getWishlistProducts>>[number];
