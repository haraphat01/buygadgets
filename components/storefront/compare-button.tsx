"use client";

import { useState, useTransition } from "react";
import { Scale } from "lucide-react";
import { toast } from "sonner";

import { addToCompare, removeFromCompare } from "@/actions/compare";
import { Button } from "@/components/ui/button";

export function CompareButton({
  productId,
  initialIsComparing,
}: {
  productId: string;
  initialIsComparing: boolean;
}) {
  const [isComparing, setIsComparing] = useState(initialIsComparing);
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      if (isComparing) {
        const result = await removeFromCompare(productId);
        if (result.success) {
          setIsComparing(false);
          toast.success("Removed from comparison.");
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await addToCompare(productId);
        if (result.success) {
          setIsComparing(true);
          toast.success("Added to comparison.");
        } else {
          toast.error(result.error);
        }
      }
    });
  }

  return (
    <Button
      type="button"
      variant={isComparing ? "secondary" : "outline"}
      size="icon"
      disabled={isPending}
      onClick={handleClick}
      title={isComparing ? "Remove from comparison" : "Add to comparison"}
    >
      <Scale className="size-4" />
    </Button>
  );
}
