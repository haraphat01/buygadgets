"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import { MoreHorizontal, Star } from "lucide-react";
import { toast } from "sonner";

import { deleteReview, updateReviewStatus } from "@/actions/reviews";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ReplyDialog } from "@/components/admin/reviews/reply-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ReviewListItem, ReviewStatusFilter } from "@/services/reviews";
import type { PaginatedResult } from "@/types";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rating
              ? "size-3.5 fill-foreground text-foreground"
              : "size-3.5 text-muted-foreground"
          }
        />
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: ReviewListItem["status"] }) {
  if (status === "APPROVED") return <Badge>Approved</Badge>;
  if (status === "REJECTED") return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="outline">Pending</Badge>;
}

export function ReviewsClient({
  result,
  q,
  status,
}: {
  result: PaginatedResult<ReviewListItem>;
  q: string;
  status: ReviewStatusFilter;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(q);
  const [replyTarget, setReplyTarget] = useState<ReviewListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ReviewListItem | null>(null);
  const [, startTransition] = useTransition();

  function updateParams(patch: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search !== q) updateParams({ q: search || undefined, page: undefined });
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function handleStatus(review: ReviewListItem, next: "APPROVED" | "REJECTED") {
    startTransition(async () => {
      const result = await updateReviewStatus(review.id, next);
      if (!result.success) toast.error(result.error);
      else toast.success(next === "APPROVED" ? "Review approved." : "Review rejected.");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold tracking-tight">Reviews</h1>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search by product, customer, or comment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={status}
          onValueChange={(value) =>
            updateParams({ status: value === "all" ? undefined : (value as string), page: undefined })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14" />
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No reviews found.
                </TableCell>
              </TableRow>
            ) : (
              result.items.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="flex size-9 items-center justify-center overflow-hidden rounded-md border bg-muted">
                      {review.product.images[0] ? (
                        <Image
                          src={review.product.images[0].url}
                          alt=""
                          width={36}
                          height={36}
                          className="size-full object-cover"
                        />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{review.product.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {review.customer.firstName} {review.customer.lastName}
                  </TableCell>
                  <TableCell>
                    <StarRating rating={review.rating} />
                  </TableCell>
                  <TableCell className="max-w-64 truncate text-muted-foreground">
                    {review.comment ?? "—"}
                    {review.reply ? (
                      <Badge variant="secondary" className="ml-2">
                        Replied
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={review.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        {review.status !== "APPROVED" ? (
                          <DropdownMenuItem onClick={() => handleStatus(review, "APPROVED")}>
                            Approve
                          </DropdownMenuItem>
                        ) : null}
                        {review.status !== "REJECTED" ? (
                          <DropdownMenuItem onClick={() => handleStatus(review, "REJECTED")}>
                            Reject
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem onClick={() => setReplyTarget(review)}>
                          {review.reply ? "Edit Reply" : "Reply"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteTarget(review)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Page {result.page} of {result.totalPages} ({result.total} reviews)
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={result.page <= 1}
            onClick={() => updateParams({ page: String(result.page - 1) })}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={result.page >= result.totalPages}
            onClick={() => updateParams({ page: String(result.page + 1) })}
          >
            Next
          </Button>
        </div>
      </div>

      <ReplyDialog
        open={!!replyTarget}
        onOpenChange={(open) => !open && setReplyTarget(null)}
        review={replyTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this review?"
        description="This can't be undone."
        onConfirm={() => deleteReview(deleteTarget!.id)}
      />
    </div>
  );
}
