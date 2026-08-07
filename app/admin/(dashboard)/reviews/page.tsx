import type { Metadata } from "next";

import { listReviews, type ReviewStatusFilter } from "@/services/reviews";
import { ReviewsClient } from "@/components/admin/reviews/reviews-client";

export const metadata: Metadata = {
  title: "Reviews",
};

export default async function ReviewsPage(props: PageProps<"/admin/reviews">) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const statusParam = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const status: ReviewStatusFilter =
    statusParam === "PENDING" || statusParam === "APPROVED" || statusParam === "REJECTED"
      ? statusParam
      : "all";
  const page = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1;

  const result = await listReviews({ q, page, status, pageSize: 20 });

  return <ReviewsClient result={result} q={q} status={status} />;
}
