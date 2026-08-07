"use client";

import { useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";

import { deleteCategory } from "@/actions/categories";
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
import {
  CategoryDialog,
  type EditableCategory,
} from "@/components/admin/categories/category-dialog";
import type { CategoryListItem } from "@/services/categories";

export function CategoriesClient({
  categories,
}: {
  categories: CategoryListItem[];
}) {
  const [dialogCategory, setDialogCategory] = useState<
    EditableCategory | null | undefined
  >(undefined);
  const [deleteTarget, setDeleteTarget] = useState<CategoryListItem | null>(
    null,
  );

  const parentOptions = categories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Categories</h1>
        <Button onClick={() => setDialogCategory(null)}>
          <Plus className="size-4" />
          New Category
        </Button>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No categories yet.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {category.parent?.name ?? "—"}
                  </TableCell>
                  <TableCell>{category._count.products}</TableCell>
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
                        <DropdownMenuItem onClick={() => setDialogCategory(category)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteTarget(category)}
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

      <CategoryDialog
        open={dialogCategory !== undefined}
        onOpenChange={(open) => !open && setDialogCategory(undefined)}
        category={dialogCategory}
        parentOptions={parentOptions}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This can't be undone."
        onConfirm={() => deleteCategory(deleteTarget!.id)}
      />
    </div>
  );
}
