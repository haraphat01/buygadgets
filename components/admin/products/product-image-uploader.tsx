"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { deleteProductImage, uploadProductImages } from "@/actions/products";
import { Button } from "@/components/ui/button";
import type { ProductWithRelations } from "@/services/products";

export function ProductImageUploader({
  productId,
  images,
}: {
  productId: string;
  images: ProductWithRelations["images"];
}) {
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (const file of Array.from(files)) formData.append("files", file);

    startTransition(async () => {
      const result = await uploadProductImages(productId, formData);
      if (result.success) {
        toast.success("Images uploaded.");
      } else {
        toast.error(result.error);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  function handleDelete(imageId: string) {
    setDeletingId(imageId);
    startTransition(async () => {
      const result = await deleteProductImage(imageId);
      if (!result.success) toast.error(result.error);
      setDeletingId(null);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {images.map((image) => (
          <div key={image.id} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
            <Image
              src={image.url}
              alt={image.altText ?? ""}
              fill
              sizes="(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 50vw"
              className="object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100"
              disabled={deletingId === image.id}
              onClick={() => handleDelete(image.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground hover:bg-muted/50">
          <Upload className="size-5" />
          <span className="text-xs">{isPending ? "Uploading..." : "Add images"}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={isPending}
            onChange={handleFilesSelected}
          />
        </label>
      </div>
    </div>
  );
}
