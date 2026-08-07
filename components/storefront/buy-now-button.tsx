"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { toast } from "sonner";

import { addToCart } from "@/actions/cart";
import { Button } from "@/components/ui/button";

export function BuyNowButton({
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await addToCart({ productId, variantId, quantity });
      if (result.success) router.push("/checkout");
      else toast.error(result.error);
    });
  }

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={handleClick}
      disabled={disabled || isPending}
      className={className}
      size={size}
    >
      <Zap className="size-4" />
      {isPending ? "Processing..." : "Buy Now"}
    </Button>
  );
}
