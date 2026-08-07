"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const METHOD_LABEL = {
  CREDIT_DIRECT: "Credit Direct",
  KLUMP: "Klump",
} as const;

export function CreditKlumpDialog({
  open,
  method,
  popupMessage,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  open: boolean;
  method: "CREDIT_DIRECT" | "KLUMP" | null;
  popupMessage: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{method ? METHOD_LABEL[method] : ""}</DialogTitle>
          <DialogDescription>{popupMessage}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Please wait..." : "Chat to use this option"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
