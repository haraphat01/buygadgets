"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  productName,
}: {
  images: { id: string; url: string; altText: string | null }[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
        {active ? (
          <Image
            src={active.url}
            alt={active.altText ?? productName}
            fill
            priority
            className="object-cover"
          />
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-lg border-2 bg-muted",
                index === activeIndex ? "border-foreground" : "border-transparent",
              )}
            >
              <Image
                src={image.url}
                alt={image.altText ?? productName}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
