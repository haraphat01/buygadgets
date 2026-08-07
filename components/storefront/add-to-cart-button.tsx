"use client";

import { useTransition } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { addToCart } from "@/actions/cart";
import { Button } from "@/components/ui/button";

export function AddToCartButton({
  productId,
  variantId,
  quantity = 1,
  disabled,
  className,
  size,
}: {
  productId: string;
  variantId?: string | null;
  quantity?: number;
  disabled?: boolean;
  className?: string;
  size?: "default" | "sm" | "lg";
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await addToCart({ productId, variantId, quantity });
      if (result.success) toast.success("Added to cart.");
      else toast.error(result.error);
    });
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={disabled || isPending}
      className={className}
      size={size}
    >
      <ShoppingCart className="size-4" />
      {isPending ? "Adding..." : "Add to Cart"}
    </Button>
  );
}
