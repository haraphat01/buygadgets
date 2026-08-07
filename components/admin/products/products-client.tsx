"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";

import { deleteProduct, toggleArchiveProduct } from "@/actions/products";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { ProductListItem, ProductStatusFilter } from "@/services/products";
import type { PaginatedResult } from "@/types";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function ProductsClient({
  result,
  q,
  status,
}: {
  result: PaginatedResult<ProductListItem>;
  q: string;
  status: ProductStatusFilter;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(q);
  const [deleteTarget, setDeleteTarget] = useState<ProductListItem | null>(null);
  const [, startTransition] = useTransition();

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

  function handleToggleArchive(product: ProductListItem) {
    startTransition(async () => {
      const result = await toggleArchiveProduct(product.id, !product.archived);
      if (!result.success) toast.error(result.error);
      else toast.success(product.archived ? "Product unarchived." : "Product archived.");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Products</h1>
        <Button render={<Link href="/admin/products/new" />}>
          <Plus className="size-4" />
          New Product
        </Button>
      </div>

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
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14" />
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              result.items.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/admin/products/${product.id}`} className="hover:underline">
                      {product.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.category?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.brand?.name ?? "—"}
                  </TableCell>
                  <TableCell>{currency.format(Number(product.price))}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.archived ? (
                        <Badge variant="secondary">Archived</Badge>
                      ) : product.published ? (
                        <Badge>Published</Badge>
                      ) : (
                        <Badge variant="outline">Draft</Badge>
                      )}
                      {product.featured ? <Badge variant="secondary">Featured</Badge> : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          render={<Link href={`/admin/products/${product.id}`} />}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleArchive(product)}>
                          {product.archived ? "Unarchive" : "Archive"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteTarget(product)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This permanently deletes the product and its images. This can't be undone."
        onConfirm={() => deleteProduct(deleteTarget!.id)}
      />
    </div>
  );
}
