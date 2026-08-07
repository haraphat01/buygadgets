"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";

import { toggleProductFeatured } from "@/actions/homepage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { ProductPickerItem } from "@/services/homepage";

export function FeaturedProductsSection({ products }: { products: ProductPickerItem[] }) {
  const [search, setSearch] = useState("");
  const [, startTransition] = useTransition();
  const [localFeatured, setLocalFeatured] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
    );
  }, [products, search]);

  function handleToggle(product: ProductPickerItem, next: boolean) {
    setLocalFeatured((prev) => ({ ...prev, [product.id]: next }));
    startTransition(async () => {
      const result = await toggleProductFeatured(product.id, next);
      if (!result.success) {
        toast.error(result.error);
        setLocalFeatured((prev) => ({ ...prev, [product.id]: product.featured }));
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Featured Products</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex flex-col divide-y">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No products found.</p>
          ) : (
            filtered.map((product) => {
              const checked = localFeatured[product.id] ?? product.featured;
              return (
                <div key={product.id} className="flex items-center gap-3 py-2">
                  <div className="flex size-9 items-center justify-center overflow-hidden rounded-md border bg-muted">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].url}
                        alt=""
                        width={36}
                        height={36}
                        className="size-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                  </div>
                  <Switch checked={checked} onCheckedChange={(v) => handleToggle(product, v)} />
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
