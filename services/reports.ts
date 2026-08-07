import { connection } from "next/server";

import { prisma } from "@/lib/prisma";
import { computeStockStatus, DEFAULT_LOW_STOCK_THRESHOLD } from "@/lib/inventory-status";

const FULFILLED_STATUSES = ["PAID", "PROCESSING", "READY_FOR_PICKUP", "SHIPPED", "DELIVERED"] as const;

function defaultRange() {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 30);
  return { from, to };
}

export async function getSalesRevenueReport({ from, to }: { from?: Date; to?: Date } = {}) {
  await connection();
  const range = { from: from ?? defaultRange().from, to: to ?? defaultRange().to };

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: range.from, lte: range.to } },
    select: { id: true, total: true, status: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const fulfilled = orders.filter((o) => (FULFILLED_STATUSES as readonly string[]).includes(o.status));
  const totalRevenue = fulfilled.reduce((sum, o) => sum + Number(o.total), 0);
  const totalOrders = orders.length;
  const averageOrderValue = fulfilled.length > 0 ? totalRevenue / fulfilled.length : 0;

  const byDay = new Map<string, { orders: number; revenue: number }>();
  for (const order of orders) {
    const day = order.createdAt.toISOString().slice(0, 10);
    const entry = byDay.get(day) ?? { orders: 0, revenue: 0 };
    entry.orders += 1;
    if ((FULFILLED_STATUSES as readonly string[]).includes(order.status)) {
      entry.revenue += Number(order.total);
    }
    byDay.set(day, entry);
  }
  const daily = [...byDay.entries()]
    .map(([date, v]) => ({ date, orders: v.orders, revenue: v.revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { range, totalOrders, totalRevenue, averageOrderValue, daily };
}

export async function getInventoryReport() {
  const [products, inventoryRows] = await Promise.all([
    prisma.product.findMany({
      select: { id: true, name: true, sku: true, quantity: true },
      orderBy: { name: "asc" },
    }),
    prisma.inventory.findMany({ where: { variantId: null } }),
  ]);

  const thresholdByProduct = new Map(inventoryRows.map((row) => [row.productId, row.lowStockThreshold]));

  return products.map((product) => {
    const threshold = thresholdByProduct.get(product.id) ?? DEFAULT_LOW_STOCK_THRESHOLD;
    return {
      ...product,
      threshold,
      status: computeStockStatus(product.quantity, threshold),
    };
  });
}

export type InventoryReportRow = Awaited<ReturnType<typeof getInventoryReport>>[number];

export async function getProductsReport({ from, to }: { from?: Date; to?: Date } = {}) {
  await connection();
  const range = { from: from ?? defaultRange().from, to: to ?? defaultRange().to };

  const items = await prisma.orderItem.findMany({
    where: { order: { createdAt: { gte: range.from, lte: range.to } } },
    select: { productId: true, name: true, quantity: true, subtotal: true },
  });

  const byProduct = new Map<string, { name: string; unitsSold: number; revenue: number }>();
  for (const item of items) {
    const key = item.productId ?? item.name;
    const entry = byProduct.get(key) ?? { name: item.name, unitsSold: 0, revenue: 0 };
    entry.unitsSold += item.quantity;
    entry.revenue += Number(item.subtotal);
    byProduct.set(key, entry);
  }

  return [...byProduct.values()].sort((a, b) => b.revenue - a.revenue);
}

export type ProductsReportRow = Awaited<ReturnType<typeof getProductsReport>>[number];

export async function getCustomersReport() {
  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      createdAt: true,
      orders: { select: { total: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return customers
    .map((customer) => ({
      id: customer.id,
      name: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      createdAt: customer.createdAt,
      orderCount: customer.orders.length,
      totalSpend: customer.orders.reduce((sum, o) => sum + Number(o.total), 0),
    }))
    .sort((a, b) => b.totalSpend - a.totalSpend);
}

export type CustomersReportRow = Awaited<ReturnType<typeof getCustomersReport>>[number];
