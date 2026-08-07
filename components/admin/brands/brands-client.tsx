"use client";

import { useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import Image from "next/image";

import { deleteBrand } from "@/actions/brands";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BrandDialog, type EditableBrand } from "@/components/admin/brands/brand-dialog";
import type { BrandListItem } from "@/services/brands";

export function BrandsClient({ brands }: { brands: BrandListItem[] }) {
  const [dialogBrand, setDialogBrand] = useState<EditableBrand | null | undefined>(
    undefined,
  );
  const [deleteTarget, setDeleteTarget] = useState<BrandListItem | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Brands</h1>
        <Button onClick={() => setDialogBrand(null)}>
          <Plus className="size-4" />
          New Brand
        </Button>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14" />
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No brands yet.
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    <div className="flex size-8 items-center justify-center overflow-hidden rounded-md border bg-muted">
                      {brand.logoUrl ? (
                        <Image
                          src={brand.logoUrl}
                          alt=""
                          width={32}
                          height={32}
                          className="size-full object-cover"
                        />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell className="text-muted-foreground">{brand.slug}</TableCell>
                  <TableCell>{brand._count.products}</TableCell>
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
                        <DropdownMenuItem onClick={() => setDialogBrand(brand)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteTarget(brand)}
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

      <BrandDialog
        open={dialogBrand !== undefined}
        onOpenChange={(open) => !open && setDialogBrand(undefined)}
        brand={dialogBrand}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This can't be undone."
        onConfirm={() => deleteBrand(deleteTarget!.id)}
      />
    </div>
  );
}
