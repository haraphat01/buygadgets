"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { replyToReview } from "@/actions/reviews";
import { replySchema, type ReplyValues } from "@/lib/validations/review";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ReviewListItem } from "@/services/reviews";

export function ReplyDialog({
  open,
  onOpenChange,
  review,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: ReviewListItem | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reply to review</DialogTitle>
        </DialogHeader>
        {/* Remounted (via key) each time a different review is opened, so
            form state starts fresh without a reset effect. */}
        {open && review ? (
          <ReplyForm key={review.id} review={review} onOpenChange={onOpenChange} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ReplyForm({
  review,
  onOpenChange,
}: {
  review: ReviewListItem;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReplyValues>({
    resolver: zodResolver(replySchema),
    defaultValues: { reply: review.reply ?? "" },
  });

  function onSubmit(values: ReplyValues) {
    startTransition(async () => {
      const result = await replyToReview(review.id, values);
      if (result.success) {
        toast.success("Reply saved.");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
      <p className="text-sm text-muted-foreground">
        {review.comment ?? "(No comment left, rating only)"}
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reply">Reply</Label>
        <Textarea id="reply" rows={4} {...register("reply")} aria-invalid={!!errors.reply} />
        {errors.reply ? <p className="text-sm text-destructive">{errors.reply.message}</p> : null}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}
