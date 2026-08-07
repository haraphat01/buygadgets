"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { addToWishlist, removeFromWishlist } from "@/actions/wishlist";
import { Button } from "@/components/ui/button";

export function WishlistButton({
  productId,
  initialIsWishlisted,
}: {
  productId: string;
  initialIsWishlisted: boolean;
}) {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      if (isWishlisted) {
        const result = await removeFromWishlist(productId);
        if (result.success) {
          setIsWishlisted(false);
          toast.success("Removed from wishlist.");
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await addToWishlist(productId);
        if (result.success) {
          setIsWishlisted(true);
          toast.success("Added to wishlist.");
        } else {
          toast.error(result.error);
        }
      }
    });
  }

  return (
    <Button
      type="button"
      variant={isWishlisted ? "secondary" : "outline"}
      size="icon"
      disabled={isPending}
      onClick={handleClick}
      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart className={isWishlisted ? "size-4 fill-current" : "size-4"} />
    </Button>
  );
}
