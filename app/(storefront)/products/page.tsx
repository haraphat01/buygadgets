import type { Metadata } from "next";
import { Suspense } from "react";

import {
  getStorefrontBrands,
  getStorefrontCategories,
  listStorefrontProducts,
  type ProductSort,
} from "@/services/storefront-products";
import { ProductsListing } from "@/components/storefront/products-listing";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductCondition } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Shop",
};

const SORT_VALUES: ProductSort[] = ["newest", "price_asc", "price_desc", "name_asc"];
const CONDITION_VALUES: ProductCondition[] = ["NEW", "USED", "REFURBISHED"];

function ProductsPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Skeleton className="h-8 w-32" />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full" />
        ))}
      </div>
    </div>
  );
}

// searchParams is a runtime API — reading it (even via `await`) blocks the
// static shell unless deferred behind Suspense, per Cache Components. The
// filter chrome has nothing worth prerendering without the query anyway, so
// the whole results section streams in behind a skeleton instead.
export default function ProductsPage(props: PageProps<"/products">) {
  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsResults searchParams={props.searchParams} />
    </Suspense>
  );
}

async function ProductsResults({
  searchParams: searchParamsPromise,
}: {
  searchParams: PageProps<"/products">["searchParams"];
}) {
  const searchParams = await searchParamsPromise;

  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const categorySlug = typeof searchParams.category === "string" ? searchParams.category : "";
  const brandSlug = typeof searchParams.brand === "string" ? searchParams.brand : "";
  const conditionParam = typeof searchParams.condition === "string" ? searchParams.condition : "";
  const condition = CONDITION_VALUES.includes(conditionParam as ProductCondition)
    ? (conditionParam as ProductCondition)
    : undefined;
  const sortParam = typeof searchParams.sort === "string" ? searchParams.sort : "newest";
  const sort = SORT_VALUES.includes(sortParam as ProductSort) ? (sortParam as ProductSort) : "newest";
  const page = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1;

  const [result, categories, brands] = await Promise.all([
    listStorefrontProducts({
      q,
      categorySlug: categorySlug || undefined,
      brandSlug: brandSlug || undefined,
      condition,
      sort,
      page,
    }),
    getStorefrontCategories(),
    getStorefrontBrands(),
  ]);

  return (
    <ProductsListing
      result={result}
      categories={categories}
      brands={brands}
      q={q}
      categorySlug={categorySlug}
      brandSlug={brandSlug}
      condition={condition ?? ""}
      sort={sort}
    />
  );
}
