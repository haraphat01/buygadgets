"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Image from "next/image";

import { createBrand, updateBrand, uploadBrandLogo } from "@/actions/brands";
import { brandSchema, type BrandValues } from "@/lib/validations/brand";
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

export type EditableBrand = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
};

export function BrandDialog({
  open,
  onOpenChange,
  brand,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: EditableBrand | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{brand ? "Edit brand" : "New brand"}</DialogTitle>
        </DialogHeader>
        {/* Remounted (via key) each time the dialog opens for a different
            brand, so form/local state starts fresh without a reset effect. */}
        {open ? (
          <BrandForm key={brand?.id ?? "new"} brand={brand} onOpenChange={onOpenChange} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function BrandForm({
  brand,
  onOpenChange,
}: {
  brand?: EditableBrand | null;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = !!brand;
  const [isPending, startTransition] = useTransition();
  const [slugEdited, setSlugEdited] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(brand?.logoUrl ?? null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BrandValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: brand
      ? {
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          description: brand.description ?? "",
          logoUrl: brand.logoUrl ?? "",
        }
      : { name: "", slug: "", description: "", logoUrl: "" },
  });

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
    setLogoPreview(file ? URL.createObjectURL(file) : (brand?.logoUrl ?? null));
  }

  function onSubmit(values: BrandValues) {
    startTransition(async () => {
      let logoUrl = values.logoUrl;

      if (logoFile) {
        const formData = new FormData();
        formData.set("file", logoFile);
        const uploadResult = await uploadBrandLogo(formData);
        if (!uploadResult.success) {
          toast.error(uploadResult.error);
          return;
        }
        logoUrl = uploadResult.data.url;
      }

      const payload = { ...values, logoUrl };
      const result = isEdit ? await updateBrand(payload) : await createBrand(payload);
      if (result.success) {
        toast.success(isEdit ? "Brand updated." : "Brand created.");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
      <div className="flex items-center gap-3">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
          {logoPreview ? (
            <Image
              src={logoPreview}
              alt=""
              width={56}
              height={56}
              className="size-full object-cover"
            />
          ) : (
            <span className="text-[10px] text-muted-foreground">No logo</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="brand-logo">Logo</Label>
          <input
            id="brand-logo"
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="brand-name">Name</Label>
        <Input
          id="brand-name"
          {...register("name", {
            onChange: (e) => {
              if (!slugEdited) setValue("slug", slugify(e.target.value));
            },
          })}
          aria-invalid={!!errors.name}
        />
        {errors.name ? (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="brand-slug">Slug</Label>
        <Input
          id="brand-slug"
          {...register("slug", { onChange: () => setSlugEdited(true) })}
          aria-invalid={!!errors.slug}
        />
        {errors.slug ? (
          <p className="text-sm text-destructive">{errors.slug.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="brand-description">Description</Label>
        <Textarea id="brand-description" {...register("description")} />
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
