"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { BuyNowButton } from "@/components/storefront/buy-now-button";
import { CompareButton } from "@/components/storefront/compare-button";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductDetail } from "@/services/storefront-products";

export function ProductPurchasePanel({
  productId,
  variants,
  outOfStock,
  isComparing,
  isWishlisted,
}: {
  productId: string;
  variants: ProductDetail["variants"];
  outOfStock: boolean;
  isComparing: boolean;
  isWishlisted: boolean;
}) {
  const [variantId, setVariantId] = useState<string | undefined>(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex flex-col gap-3">
      {variants.length > 0 ? (
        <div>
          <p className="mb-1.5 text-sm font-medium">Options</p>
          <Select value={variantId} onValueChange={(v) => setVariantId(v as string)}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {variants.map((variant) => (
                <SelectItem key={variant.id} value={variant.id}>
                  {variant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <p className="text-sm font-medium">Quantity</p>
        <div className="flex items-center rounded-lg border">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Minus className="size-3" />
          </Button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => setQuantity((q) => q + 1)}>
            <Plus className="size-3" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <AddToCartButton
          productId={productId}
          variantId={variantId ?? null}
          quantity={quantity}
          disabled={outOfStock}
          className="flex-1 sm:flex-none"
        />
        <BuyNowButton
          productId={productId}
          variantId={variantId ?? null}
          quantity={quantity}
          disabled={outOfStock}
          className="flex-1 sm:flex-none"
        />
        <WishlistButton productId={productId} initialIsWishlisted={isWishlisted} />
        <CompareButton productId={productId} initialIsComparing={isComparing} />
      </div>
    </div>
  );
}
