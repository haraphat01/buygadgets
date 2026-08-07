import { prisma } from "@/lib/prisma";

export function listBrands() {
  return prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export type BrandListItem = Awaited<ReturnType<typeof listBrands>>[number];
