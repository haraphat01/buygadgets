"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/storefront/product-card";
import { PRODUCT_CONDITIONS } from "@/lib/validations/product";
import type { ProductSort } from "@/services/storefront-products";
import type { StorefrontProduct } from "@/services/storefront";
import type { PaginatedResult } from "@/types";

export function ProductsListing({
  result,
  categories,
  brands,
  q,
  categorySlug,
  brandSlug,
  condition,
  sort,
}: {
  result: PaginatedResult<StorefrontProduct>;
  categories: { id: string; name: string; slug: string }[];
  brands: { id: string; name: string; slug: string }[];
  q: string;
  categorySlug: string;
  brandSlug: string;
  condition: string;
  sort: ProductSort;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(q);

  function updateParams(patch: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search !== q) updateParams({ q: search || undefined, page: undefined });
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-semibold tracking-tight">Shop</h1>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={categorySlug || "all"}
          onValueChange={(v) =>
            updateParams({ category: v === "all" ? undefined : (v as string), page: undefined })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={brandSlug || "all"}
          onValueChange={(v) =>
            updateParams({ brand: v === "all" ? undefined : (v as string), page: undefined })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b.id} value={b.slug}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={condition || "all"}
          onValueChange={(v) =>
            updateParams({ condition: v === "all" ? undefined : (v as string), page: undefined })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Condition</SelectItem>
            {PRODUCT_CONDITIONS.map((c) => (
              <SelectItem key={c} value={c}>
                {c.charAt(0) + c.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => updateParams({ sort: v as string, page: undefined })}>
          <SelectTrigger>
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="name_asc">Name: A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {result.items.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          No products match your filters.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {result.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {result.totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {result.page} of {result.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={result.page <= 1}
              onClick={() => updateParams({ page: String(result.page - 1) })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={result.page >= result.totalPages}
              onClick={() => updateParams({ page: String(result.page + 1) })}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
