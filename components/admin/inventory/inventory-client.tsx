"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import { PackageSearch } from "lucide-react";

import { AdjustStockDialog } from "@/components/admin/inventory/adjust-stock-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { getStockActivity, InventoryListItem, InventoryStatusFilter } from "@/services/inventory";
import type { PaginatedResult } from "@/types";

type StockAdjustmentMeta = {
  productName: string;
  sku: string;
  previousQuantity: number;
  newQuantity: number;
  delta: number;
  reason: string | null;
};

function StatusBadge({ status }: { status: InventoryListItem["stockStatus"] }) {
  if (status === "out") return <Badge variant="destructive">Out of Stock</Badge>;
  if (status === "low") return <Badge variant="secondary">Low Stock</Badge>;
  return <Badge variant="outline">In Stock</Badge>;
}

export function InventoryClient({
  result,
  activity,
  q,
  status,
}: {
  result: PaginatedResult<InventoryListItem>;
  activity: Awaited<ReturnType<typeof getStockActivity>>;
  q: string;
  status: InventoryStatusFilter;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(q);
  const [adjustTarget, setAdjustTarget] = useState<InventoryListItem | null>(null);

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
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold tracking-tight">Inventory</h1>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={status}
          onValueChange={(value) =>
            updateParams({ status: value === "all" ? undefined : (value as string), page: undefined })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="out">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14" />
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Threshold</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              result.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex size-9 items-center justify-center overflow-hidden rounded-md border bg-muted">
                      {item.images[0] ? (
                        <Image
                          src={item.images[0].url}
                          alt=""
                          width={36}
                          height={36}
                          className="size-full object-cover"
                        />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.category?.name ?? "—"}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.threshold}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.stockStatus} />
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => setAdjustTarget(item)}>
                      Adjust
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Page {result.page} of {result.totalPages} ({result.total} products)
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Stock Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <div className="flex h-24 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              <PackageSearch className="size-5" />
              No stock adjustments yet.
            </div>
          ) : (
            <ul className="flex flex-col divide-y">
              {activity.map((entry) => {
                const meta = entry.metadata as unknown as StockAdjustmentMeta;
                return (
                  <li key={entry.id} className="flex items-center justify-between gap-4 py-2 text-sm">
                    <div>
                      <p className="font-medium">{meta.productName}</p>
                      <p className="text-muted-foreground">
                        {meta.previousQuantity} → {meta.newQuantity}
                        {meta.reason ? ` · ${meta.reason}` : ""}
                        {entry.actor?.fullName ? ` · by ${entry.actor.fullName}` : ""}
                      </p>
                    </div>
                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString()}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <AdjustStockDialog
        open={!!adjustTarget}
        onOpenChange={(open) => !open && setAdjustTarget(null)}
        item={adjustTarget}
      />
    </div>
  );
}
