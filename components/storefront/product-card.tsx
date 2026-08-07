import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatNaira } from "@/lib/currency";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import type { StorefrontProduct } from "@/services/storefront";

export function ProductCard({ product }: { product: StorefrontProduct }) {
  return (
    <Card className="overflow-hidden py-0">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square bg-muted">
          {product.images[0] ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover"
            />
          ) : null}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.newArrival ? <Badge>New</Badge> : null}
            {product.onFlashSale ? <Badge variant="destructive">Flash Sale</Badge> : null}
          </div>
        </div>
        <CardContent className="flex flex-col gap-1 px-3 pt-3 pb-0">
          {product.brand ? (
            <p className="text-xs text-muted-foreground">{product.brand.name}</p>
          ) : null}
          <p className="line-clamp-2 text-sm font-medium">{product.name}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-sm font-semibold">
              {formatNaira(product.discountPrice ?? product.price)}
            </span>
            {product.discountPrice ? (
              <span className="text-xs text-muted-foreground line-through">
                {formatNaira(product.price)}
              </span>
            ) : null}
          </div>
        </CardContent>
      </Link>
      <CardContent className="px-3 pt-2 pb-3">
        <AddToCartButton productId={product.id} className="w-full" size="sm" />
      </CardContent>
    </Card>
  );
}
