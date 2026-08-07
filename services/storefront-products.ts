"use cache";

import { cacheLife } from "next/cache";

import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize-product";
import { computeStockStatus, DEFAULT_LOW_STOCK_THRESHOLD } from "@/lib/inventory-status";
import type { ProductCondition } from "@/generated/prisma/client";

const productInclude = {
  brand: { select: { name: true } },
  images: { orderBy: { position: "asc" as const }, take: 1 },
};

export type ProductSort = "newest" | "price_asc" | "price_desc" | "name_asc";

export async function listStorefrontProducts({
  q,
  categorySlug,
  brandSlug,
  condition,
  minPrice,
  maxPrice,
  sort = "newest",
  page = 1,
  pageSize = 12,
}: {
  q?: string;
  categorySlug?: string;
  brandSlug?: string;
  condition?: ProductCondition;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}) {
  cacheLife("minutes");

  const where = {
    published: true,
    archived: false,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { sku: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(brandSlug ? { brand: { slug: brandSlug } } : {}),
    ...(condition ? { condition } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? { price: { ...(minPrice !== undefined ? { gte: minPrice } : {}), ...(maxPrice !== undefined ? { lte: maxPrice } : {}) } }
      : {}),
  };

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" as const }
      : sort === "price_desc"
        ? { price: "desc" as const }
        : sort === "name_asc"
          ? { name: "asc" as const }
          : { createdAt: "desc" as const };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: items.map(serializeProduct),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getStorefrontCategories() {
  cacheLife("minutes");
  return prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });
}

export async function getStorefrontBrands() {
  cacheLife("minutes");
  return prisma.brand.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });
}

export async function getProductBySlug(slug: string) {
  cacheLife("minutes");

  const product = await prisma.product.findFirst({
    where: { slug, published: true, archived: false },
    include: {
      brand: { select: { name: true, slug: true } },
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { createdAt: "asc" } },
      reviews: {
        where: { status: "APPROVED" },
        include: { customer: { select: { firstName: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) return null;

  const inventory = await prisma.inventory.findFirst({
    where: { productId: product.id, variantId: null },
    select: { lowStockThreshold: true },
  });
  const threshold = inventory?.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD;

  return {
    ...serializeProduct(product),
    variants: product.variants.map((variant) => ({
      ...variant,
      price: variant.price ? Number(variant.price) : null,
    })),
    stockStatus: computeStockStatus(product.quantity, threshold),
  };
}

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

export async function getRelatedProducts(categoryId: string, excludeProductId: string) {
  cacheLife("minutes");
  const products = await prisma.product.findMany({
    where: {
      categoryId,
      published: true,
      archived: false,
      id: { not: excludeProductId },
    },
    include: productInclude,
    take: 4,
  });
  return products.map(serializeProduct);
}
