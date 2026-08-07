import { prisma } from "@/lib/prisma";
import {
  computeStockStatus,
  DEFAULT_LOW_STOCK_THRESHOLD,
  type StockStatus,
} from "@/lib/inventory-status";

export type InventoryStatusFilter = "all" | StockStatus;

/// Products + their low-stock threshold (from `Inventory`, `variantId:
/// null`, defaulting when no row exists yet). Status filtering/pagination
/// happen in memory after the threshold join — fine at this catalog size,
/// and avoids a cross-table SQL comparison for a small admin tool.
export async function listInventory({
  q,
  page = 1,
  pageSize = 20,
  status = "all",
}: {
  q?: string;
  page?: number;
  pageSize?: number;
  status?: InventoryStatusFilter;
}) {
  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { sku: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [products, inventoryRows] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
        category: { select: { name: true } },
        images: { orderBy: { position: "asc" }, take: 1 },
      },
      orderBy: { name: "asc" },
    }),
    prisma.inventory.findMany({ where: { variantId: null } }),
  ]);

  const thresholdByProduct = new Map(
    inventoryRows.map((row) => [row.productId, row.lowStockThreshold]),
  );

  const items = products.map((product) => {
    const threshold = thresholdByProduct.get(product.id) ?? DEFAULT_LOW_STOCK_THRESHOLD;
    return {
      ...product,
      threshold,
      stockStatus: computeStockStatus(product.quantity, threshold),
    };
  });

  const filtered = status === "all" ? items : items.filter((i) => i.stockStatus === status);
  const total = filtered.length;
  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export type InventoryListItem = Awaited<ReturnType<typeof listInventory>>["items"][number];

export async function getStockActivity({ take = 20 }: { take?: number } = {}) {
  return prisma.activityLog.findMany({
    where: { action: "stock_adjustment" },
    orderBy: { createdAt: "desc" },
    take,
    include: { actor: { select: { fullName: true } } },
  });
}
