"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import type { HeroBanner } from "@/services/storefront";

export function HeroCarousel({ banners }: { banners: HeroBanner[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <div className="flex aspect-[21/9] w-full items-center justify-center rounded-xl bg-linear-to-br from-primary/10 to-muted text-center sm:aspect-[3/1]">
        <div>
          <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Smartphones, tablets & gadgets
          </p>
          <p className="mt-2 text-muted-foreground">Quality devices, delivered fast.</p>
        </div>
      </div>
    );
  }

  const banner = banners[index];
  const image = (
    <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl bg-muted sm:aspect-[3/1]">
      <Image src={banner.imageUrl} alt={banner.title} fill priority className="object-cover" />
      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-4 sm:p-8">
        <p className="text-lg font-semibold text-white sm:text-2xl">{banner.title}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {banner.link ? <Link href={banner.link}>{image}</Link> : image}
      {banners.length > 1 ? (
        <div className="flex justify-center gap-1.5">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show banner ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-foreground" : "w-1.5 bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
