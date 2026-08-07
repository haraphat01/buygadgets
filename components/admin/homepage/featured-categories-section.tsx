"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { toggleCategoryFeatured } from "@/actions/homepage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { CategoryPickerItem } from "@/services/homepage";

export function FeaturedCategoriesSection({ categories }: { categories: CategoryPickerItem[] }) {
  const [search, setSearch] = useState("");
  const [, startTransition] = useTransition();
  const [localFeatured, setLocalFeatured] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, search]);

  function handleToggle(category: CategoryPickerItem, next: boolean) {
    setLocalFeatured((prev) => ({ ...prev, [category.id]: next }));
    startTransition(async () => {
      const result = await toggleCategoryFeatured(category.id, next);
      if (!result.success) {
        toast.error(result.error);
        setLocalFeatured((prev) => ({ ...prev, [category.id]: category.featured }));
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Featured Categories</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex flex-col divide-y">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No categories found.</p>
          ) : (
            filtered.map((category) => {
              const checked = localFeatured[category.id] ?? category.featured;
              return (
                <div key={category.id} className="flex items-center gap-3 py-2">
                  <p className="flex-1 text-sm font-medium">{category.name}</p>
                  <Switch checked={checked} onCheckedChange={(v) => handleToggle(category, v)} />
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
