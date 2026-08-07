import { prisma } from "@/lib/prisma";

export type CustomerTypeFilter = "all" | "guest" | "registered";
export type CustomerStatusFilter = "all" | "active" | "disabled";

export async function listCustomers({
  q,
  page = 1,
  pageSize = 20,
  type = "all",
  status = "all",
}: {
  q?: string;
  page?: number;
  pageSize?: number;
  type?: CustomerTypeFilter;
  status?: CustomerStatusFilter;
}) {
  const where = {
    ...(type === "guest" ? { isGuest: true } : type === "registered" ? { isGuest: false } : {}),
    ...(status === "active" ? { disabled: false } : status === "disabled" ? { disabled: true } : {}),
    ...(q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" as const } },
            { lastName: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export type CustomerListItem = Awaited<ReturnType<typeof listCustomers>>["items"][number];

export function getCustomerById(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      addresses: { orderBy: { createdAt: "desc" } },
      orders: { orderBy: { createdAt: "desc" } },
    },
  });
}

export type CustomerWithRelations = NonNullable<Awaited<ReturnType<typeof getCustomerById>>>;
