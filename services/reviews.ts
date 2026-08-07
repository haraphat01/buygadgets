import { prisma } from "@/lib/prisma";
import type { ReviewStatus } from "@/generated/prisma/client";

export type ReviewStatusFilter = "all" | ReviewStatus;

export async function listReviews({
  q,
  page = 1,
  pageSize = 20,
  status = "all",
}: {
  q?: string;
  page?: number;
  pageSize?: number;
  status?: ReviewStatusFilter;
}) {
  const where = {
    ...(status !== "all" ? { status } : {}),
    ...(q
      ? {
          OR: [
            { comment: { contains: q, mode: "insensitive" as const } },
            { product: { name: { contains: q, mode: "insensitive" as const } } },
            { customer: { firstName: { contains: q, mode: "insensitive" as const } } },
            { customer: { lastName: { contains: q, mode: "insensitive" as const } } },
            { customer: { email: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        product: { select: { name: true, images: { orderBy: { position: "asc" }, take: 1 } } },
        customer: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.review.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export type ReviewListItem = Awaited<ReturnType<typeof listReviews>>["items"][number];
