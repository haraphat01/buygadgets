"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createCategory, updateCategory } from "@/actions/categories";
import { categorySchema, type CategoryValues } from "@/lib/validations/category";
import { slugify } from "@/lib/slug";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type EditableCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
};

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  parentOptions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: EditableCategory | null;
  parentOptions: { id: string; name: string }[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? "Edit category" : "New category"}</DialogTitle>
        </DialogHeader>
        {/* Remounted (via key) each time the dialog opens for a different
            category, so form state starts fresh without a reset effect. */}
        {open ? (
          <CategoryForm
            key={category?.id ?? "new"}
            category={category}
            parentOptions={parentOptions}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function CategoryForm({
  category,
  parentOptions,
  onOpenChange,
}: {
  category?: EditableCategory | null;
  parentOptions: { id: string; name: string }[];
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = !!category;
  const [isPending, startTransition] = useTransition();
  const [slugEdited, setSlugEdited] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          imageUrl: category.imageUrl ?? "",
          parentId: category.parentId,
        }
      : {
          name: "",
          slug: "",
          description: "",
          imageUrl: "",
          parentId: null,
        },
  });

  const parentId = watch("parentId");
  const availableParents = parentOptions.filter((p) => p.id !== category?.id);

  function onSubmit(values: CategoryValues) {
    startTransition(async () => {
      const result = isEdit
        ? await updateCategory(values)
        : await createCategory(values);
      if (result.success) {
        toast.success(isEdit ? "Category updated." : "Category created.");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cat-name">Name</Label>
        <Input
          id="cat-name"
          {...register("name", {
            onChange: (e) => {
              if (!slugEdited) {
                setValue("slug", slugify(e.target.value));
              }
            },
          })}
          aria-invalid={!!errors.name}
        />
        {errors.name ? (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cat-slug">Slug</Label>
        <Input
          id="cat-slug"
          {...register("slug", {
            onChange: () => setSlugEdited(true),
          })}
          aria-invalid={!!errors.slug}
        />
        {errors.slug ? (
          <p className="text-sm text-destructive">{errors.slug.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cat-description">Description</Label>
        <Textarea id="cat-description" {...register("description")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Parent category</Label>
        <Select
          value={parentId ?? "none"}
          onValueChange={(value) =>
            setValue("parentId", value === "none" ? null : (value as string))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {availableParents.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}
