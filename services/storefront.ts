"use cache";

import { cacheLife } from "next/cache";

import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize-product";

const productInclude = {
  brand: { select: { name: true } },
  images: { orderBy: { position: "asc" as const }, take: 1 },
};

export async function getActiveHeroBanners() {
  cacheLife("minutes");
  const now = new Date();
  return prisma.banner.findMany({
    where: {
      position: "hero",
      active: true,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
}

export type HeroBanner = Awaited<ReturnType<typeof getActiveHeroBanners>>[number];

export async function getFeaturedProducts() {
  cacheLife("minutes");
  const products = await prisma.product.findMany({
    where: { featured: true, published: true, archived: false },
    include: productInclude,
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  return products.map(serializeProduct);
}

export async function getNewArrivals() {
  cacheLife("minutes");
  const products = await prisma.product.findMany({
    where: { newArrival: true, published: true, archived: false },
    include: productInclude,
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  return products.map(serializeProduct);
}

export type StorefrontProduct = Awaited<ReturnType<typeof getFeaturedProducts>>[number];

export async function getFlashSaleProducts() {
  cacheLife("minutes");
  const products = await prisma.product.findMany({
    where: {
      published: true,
      archived: false,
      discountPrice: { not: null },
      flashSaleEndsAt: { gt: new Date() },
    },
    include: productInclude,
    orderBy: { flashSaleEndsAt: "asc" },
    take: 8,
  });
  return products.map(serializeProduct);
}

export async function getBestSellers() {
  cacheLife("minutes");
  const items = await prisma.orderItem.findMany({
    where: { productId: { not: null } },
    select: { productId: true, quantity: true },
  });

  const unitsByProduct = new Map<string, number>();
  for (const item of items) {
    if (!item.productId) continue;
    unitsByProduct.set(item.productId, (unitsByProduct.get(item.productId) ?? 0) + item.quantity);
  }

  const topProductIds = [...unitsByProduct.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([productId]) => productId);

  if (topProductIds.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: topProductIds }, published: true, archived: false },
    include: productInclude,
  });

  const order = new Map(topProductIds.map((id, index) => [id, index]));
  return products
    .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
    .map(serializeProduct);
}

export async function getPopularBrands() {
  cacheLife("minutes");
  return prisma.brand.findMany({
    where: { logoUrl: { not: null } },
    orderBy: { name: "asc" },
    take: 10,
  });
}
