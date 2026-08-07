import { connection } from "next/server";

import { prisma } from "@/lib/prisma";

export function listProductsForPicker({ q }: { q?: string } = {}) {
  return prisma.product.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    select: {
      id: true,
      name: true,
      sku: true,
      featured: true,
      discountPrice: true,
      flashSaleEndsAt: true,
      images: { orderBy: { position: "asc" }, take: 1 },
    },
    orderBy: { name: "asc" },
    take: 50,
  });
}

export type ProductPickerItem = Awaited<ReturnType<typeof listProductsForPicker>>[number];

export function listCategoriesForPicker({ q }: { q?: string } = {}) {
  return prisma.category.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : {},
    select: { id: true, name: true, featured: true },
    orderBy: { name: "asc" },
    take: 50,
  });
}

export type CategoryPickerItem = Awaited<ReturnType<typeof listCategoriesForPicker>>[number];

export async function listFlashSaleProducts() {
  // `new Date()` here depends on request time, not build time — signal
  // that explicitly so Cache Components doesn't try to bake it into the
  // prerendered static shell (same reasoning as the dashboard layout's
  // `instant = false`, but scoped to just this dynamic query).
  await connection();
  return prisma.product.findMany({
    where: {
      flashSaleEndsAt: { gt: new Date() },
      discountPrice: { not: null },
    },
    select: {
      id: true,
      name: true,
      sku: true,
      price: true,
      discountPrice: true,
      flashSaleEndsAt: true,
      images: { orderBy: { position: "asc" }, take: 1 },
    },
    orderBy: { flashSaleEndsAt: "asc" },
  });
}

export type FlashSaleListItem = Awaited<ReturnType<typeof listFlashSaleProducts>>[number];
