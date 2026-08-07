import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type ProductStatusFilter = "all" | "published" | "draft" | "archived";

export async function listProducts({
  q,
  page = 1,
  pageSize = 20,
  status = "all",
}: {
  q?: string;
  page?: number;
  pageSize?: number;
  status?: ProductStatusFilter;
}) {
  const where: Prisma.ProductWhereInput = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status === "published"
      ? { published: true, archived: false }
      : status === "draft"
        ? { published: false, archived: false }
        : status === "archived"
          ? { archived: true }
          : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
        images: { orderBy: { position: "asc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export type ProductListItem = Awaited<
  ReturnType<typeof listProducts>
>["items"][number];

export function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { createdAt: "asc" } },
    },
  });
}

export type ProductWithRelations = NonNullable<
  Awaited<ReturnType<typeof getProductById>>
>;
