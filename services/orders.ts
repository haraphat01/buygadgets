import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma/client";

export type OrderStatusFilter = "all" | OrderStatus;

export async function listOrders({
  q,
  page = 1,
  pageSize = 20,
  status = "all",
}: {
  q?: string;
  page?: number;
  pageSize?: number;
  status?: OrderStatusFilter;
}) {
  const where = {
    ...(status !== "all" ? { status } : {}),
    ...(q
      ? {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" as const } },
            { firstName: { contains: q, mode: "insensitive" as const } },
            { lastName: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export type OrderListItem = Awaited<ReturnType<typeof listOrders>>["items"][number];

export function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      payments: { orderBy: { createdAt: "desc" } },
      deliveryMethod: true,
      coupon: true,
    },
  });
}

export type OrderWithRelations = NonNullable<Awaited<ReturnType<typeof getOrderById>>>;
