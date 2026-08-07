"use server";

import { listStorefrontProducts, type ProductSort } from "@/services/storefront-products";
import type { ProductCondition } from "@/generated/prisma/client";

const CONDITION_VALUES: ProductCondition[] = ["NEW", "USED", "REFURBISHED"];

// Thin client-callable wrapper — listStorefrontProducts lives in a "use
// cache" module, which client components can't call directly.
export async function searchStorefrontProducts({
  q,
  categorySlug,
  brandSlug,
  condition,
  sort,
  page,
}: {
  q: string;
  categorySlug: string;
  brandSlug: string;
  condition: string;
  sort: ProductSort;
  page: number;
}) {
  return listStorefrontProducts({
    q: q || undefined,
    categorySlug: categorySlug || undefined,
    brandSlug: brandSlug || undefined,
    condition: CONDITION_VALUES.includes(condition as ProductCondition)
      ? (condition as ProductCondition)
      : undefined,
    sort,
    page,
  });
}
