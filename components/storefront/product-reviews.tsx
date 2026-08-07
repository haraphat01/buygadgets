import { Star } from "lucide-react";

import type { ProductDetail } from "@/services/storefront-products";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={i < rating ? "size-4 fill-foreground text-foreground" : "size-4 text-muted-foreground"}
        />
      ))}
    </div>
  );
}

export function ProductReviews({ reviews }: { reviews: ProductDetail["reviews"] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="mb-4 text-xl font-semibold tracking-tight">Reviews</h2>
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{review.customer.firstName}</p>
                <StarRating rating={review.rating} />
              </div>
              {review.comment ? (
                <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
              ) : null}
              {review.reply ? (
                <div className="mt-3 rounded-md bg-muted/50 p-3 text-sm">
                  <p className="font-medium">Store reply</p>
                  <p className="mt-1 text-muted-foreground">{review.reply}</p>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
