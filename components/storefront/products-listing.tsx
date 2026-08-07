"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { searchStorefrontProducts } from "@/actions/storefront-products";
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

type Filters = {
  q: string;
  categorySlug: string;
  brandSlug: string;
  condition: string;
  sort: ProductSort;
  page: number;
};

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
  const pathname = usePathname();
  const [search, setSearch] = useState(q);
  const [filters, setFilters] = useState<Filters>({
    q,
    categorySlug,
    brandSlug,
    condition,
    sort,
    page: result.page,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((f) => (f.q === search ? f : { ...f, q: search, page: 1 }));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  // Keeps the URL shareable/bookmarkable without router.push — a Next.js
  // navigation here would re-trigger the server render this page already
  // did once, duplicating the fetch the query below owns.
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.categorySlug) params.set("category", filters.categorySlug);
    if (filters.brandSlug) params.set("brand", filters.brandSlug);
    if (filters.condition) params.set("condition", filters.condition);
    if (filters.sort !== "newest") params.set("sort", filters.sort);
    if (filters.page > 1) params.set("page", String(filters.page));
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  }, [filters, pathname]);

  const isInitialFilters =
    filters.q === q &&
    filters.categorySlug === categorySlug &&
    filters.brandSlug === brandSlug &&
    filters.condition === condition &&
    filters.sort === sort &&
    filters.page === result.page;

  const { data } = useQuery({
    queryKey: ["storefront-products", filters],
    queryFn: () => searchStorefrontProducts(filters),
    placeholderData: keepPreviousData,
    initialData: isInitialFilters ? result : undefined,
  });

  const products = data ?? result;

  function updateFilter(patch: Partial<Omit<Filters, "page">>) {
    setFilters((f) => ({ ...f, ...patch, page: 1 }));
  }

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
          value={filters.categorySlug || "all"}
          onValueChange={(v) => updateFilter({ categorySlug: v === "all" ? "" : (v as string) })}
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
          value={filters.brandSlug || "all"}
          onValueChange={(v) => updateFilter({ brandSlug: v === "all" ? "" : (v as string) })}
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
          value={filters.condition || "all"}
          onValueChange={(v) => updateFilter({ condition: v === "all" ? "" : (v as string) })}
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
        <Select
          value={filters.sort}
          onValueChange={(v) => updateFilter({ sort: v as ProductSort })}
        >
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

      {products.items.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          No products match your filters.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {products.totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {products.page} of {products.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={products.page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={products.page >= products.totalPages}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
