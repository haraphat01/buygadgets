import Image from "next/image";

import type { Brand } from "@/generated/prisma/client";

export function BrandsSection({ brands }: { brands: Brand[] }) {
  if (brands.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="mb-4 text-xl font-semibold tracking-tight">Popular Brands</h2>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="flex aspect-square items-center justify-center rounded-lg border bg-card p-4"
          >
            {brand.logoUrl ? (
              <Image
                src={brand.logoUrl}
                alt={brand.name}
                width={80}
                height={80}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-sm font-medium">{brand.name}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
