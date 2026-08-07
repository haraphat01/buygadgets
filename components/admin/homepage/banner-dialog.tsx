"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Image from "next/image";

import { createBanner, updateBanner, uploadBannerImage } from "@/actions/banners";
import { bannerSchema, type BannerFormInput, type BannerValues } from "@/lib/validations/banner";
import { toDatetimeLocalInput } from "@/lib/format";
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
import { Switch } from "@/components/ui/switch";
import type { BannerListItem } from "@/services/banners";
import type { BANNER_POSITIONS } from "@/lib/validations/banner";

export function BannerDialog({
  open,
  onOpenChange,
  banner,
  position,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner?: BannerListItem | null;
  position: (typeof BANNER_POSITIONS)[number];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{banner ? "Edit banner" : "New banner"}</DialogTitle>
        </DialogHeader>
        {open ? (
          <BannerForm
            key={banner?.id ?? "new"}
            banner={banner}
            position={position}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function BannerForm({
  banner,
  position,
  onOpenChange,
}: {
  banner?: BannerListItem | null;
  position: (typeof BANNER_POSITIONS)[number];
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = !!banner;
  const [isPending, startTransition] = useTransition();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(banner?.imageUrl ?? null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BannerFormInput, unknown, BannerValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: banner
      ? {
          id: banner.id,
          title: banner.title,
          imageUrl: banner.imageUrl,
          link: banner.link ?? "",
          position,
          active: banner.active,
          startDate: toDatetimeLocalInput(banner.startDate),
          endDate: toDatetimeLocalInput(banner.endDate),
        }
      : { title: "", imageUrl: "", link: "", position, active: true, startDate: "", endDate: "" },
  });

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : (banner?.imageUrl ?? null));
  }

  function onSubmit(values: BannerValues) {
    startTransition(async () => {
      let imageUrl = values.imageUrl;

      if (imageFile) {
        const formData = new FormData();
        formData.set("file", imageFile);
        const uploadResult = await uploadBannerImage(formData);
        if (!uploadResult.success) {
          toast.error(uploadResult.error);
          return;
        }
        imageUrl = uploadResult.data.url;
      }

      if (!imageUrl) {
        toast.error("Upload an image.");
        return;
      }

      const payload = { ...values, imageUrl };
      const result = isEdit ? await updateBanner(payload) : await createBanner(payload);
      if (result.success) {
        toast.success(isEdit ? "Banner updated." : "Banner created.");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt=""
              width={112}
              height={64}
              className="size-full object-cover"
            />
          ) : (
            <span className="text-[10px] text-muted-foreground">No image</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="banner-image">Image</Label>
          <input id="banner-image" type="file" accept="image/*" onChange={handleImageChange} className="text-sm" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="banner-title">Title</Label>
        <Input id="banner-title" {...register("title")} aria-invalid={!!errors.title} />
        {errors.title ? <p className="text-sm text-destructive">{errors.title.message}</p> : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="banner-link">Link (optional)</Label>
        <Input id="banner-link" placeholder="/products/some-product" {...register("link")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="banner-start">Starts</Label>
          <Input id="banner-start" type="datetime-local" {...register("startDate")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="banner-end">Ends</Label>
          <Input id="banner-end" type="datetime-local" {...register("endDate")} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Switch checked={watch("active")} onCheckedChange={(v) => setValue("active", v)} />
        Active
      </label>

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
