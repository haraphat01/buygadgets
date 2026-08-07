"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { toast } from "sonner";

import { removeFromCompare } from "@/actions/compare";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/currency";
import type { CompareProduct } from "@/services/compare";

const ROWS: { key: keyof CompareProduct | "availability"; label: string }[] = [
  { key: "ram", label: "RAM" },
  { key: "storage", label: "Storage" },
  { key: "processor", label: "Processor" },
  { key: "display", label: "Screen Size" },
  { key: "camera", label: "Camera" },
  { key: "battery", label: "Battery" },
  { key: "warranty", label: "Warranty" },
  { key: "availability", label: "Availability" },
];

export function CompareTable({ products }: { products: CompareProduct[] }) {
  const [isPending, startTransition] = useTransition();

  function handleRemove(productId: string) {
    startTransition(async () => {
      const result = await removeFromCompare(productId);
      if (!result.success) toast.error(result.error);
    });
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[480px] text-sm">
        <tbody>
          <tr className="border-b">
            <td className="w-32 px-4 py-3 text-muted-foreground">Image</td>
            {products.map((product) => (
              <td key={product.id} className="relative px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-1 right-1"
                  disabled={isPending}
                  onClick={() => handleRemove(product.id)}
                  title="Remove from comparison"
                >
                  <X className="size-4" />
                </Button>
                <div className="flex size-24 items-center justify-center overflow-hidden rounded-md border bg-muted">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      width={96}
                      height={96}
                      className="size-full object-cover"
                    />
                  ) : null}
                </div>
              </td>
            ))}
          </tr>

          <tr className="border-b">
            <td className="px-4 py-3 text-muted-foreground">Name</td>
            {products.map((product) => (
              <td key={product.id} className="px-4 py-3 font-medium">
                <Link href={`/products/${product.slug}`} className="hover:underline">
                  {product.name}
                </Link>
              </td>
            ))}
          </tr>

          <tr className="border-b">
            <td className="px-4 py-3 text-muted-foreground">Brand</td>
            {products.map((product) => (
              <td key={product.id} className="px-4 py-3">
                {product.brand?.name ?? "—"}
              </td>
            ))}
          </tr>

          <tr className="border-b">
            <td className="px-4 py-3 text-muted-foreground">Price</td>
            {products.map((product) => (
              <td key={product.id} className="px-4 py-3">
                {formatNaira(product.discountPrice ?? product.price)}
              </td>
            ))}
          </tr>

          {ROWS.map((row) => (
            <tr key={row.key} className="border-b last:border-b-0">
              <td className="px-4 py-3 text-muted-foreground">{row.label}</td>
              {products.map((product) => (
                <td key={product.id} className="px-4 py-3">
                  {row.key === "availability"
                    ? product.quantity > 0
                      ? "In Stock"
                      : "Out of Stock"
                    : (product[row.key as keyof CompareProduct] as string | null) || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
