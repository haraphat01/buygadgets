"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ActionResult } from "@/types";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  destructive = true,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => Promise<ActionResult>;
}) {
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await onConfirm();
      if (result.success) {
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "Working..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
