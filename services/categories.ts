import { prisma } from "@/lib/prisma";

export function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { products: true } },
    },
  });
}

export type CategoryListItem = Awaited<
  ReturnType<typeof listCategories>
>[number];
