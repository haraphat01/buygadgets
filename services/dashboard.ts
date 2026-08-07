import { connection } from "next/server";

import { prisma } from "@/lib/prisma";
import { computeStockStatus, DEFAULT_LOW_STOCK_THRESHOLD } from "@/lib/inventory-status";

const FULFILLED_STATUSES = ["PAID", "PROCESSING", "READY_FOR_PICKUP", "SHIPPED", "DELIVERED"] as const;
const SALES_CHART_DAYS = 30;

export async function getDashboardStats() {
  await connection();

  const chartFrom = new Date();
  chartFrom.setDate(chartFrom.getDate() - (SALES_CHART_DAYS - 1));
  chartFrom.setHours(0, 0, 0, 0);

  const [
    productCount,
    products,
    inventoryRows,
    customerCount,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    allOrders,
    recentOrders,
    chartOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.findMany({ select: { id: true, quantity: true } }),
    prisma.inventory.findMany({ where: { variantId: null } }),
    prisma.customer.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.order.findMany({ select: { total: true, status: true } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, orderNumber: true, firstName: true, lastName: true, total: true, status: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: chartFrom } },
      select: { total: true, status: true, createdAt: true },
    }),
  ]);

  const thresholdByProduct = new Map(
    inventoryRows.map((row) => [row.productId, row.lowStockThreshold]),
  );

  let lowStockCount = 0;
  let outOfStockCount = 0;
  for (const product of products) {
    const threshold = thresholdByProduct.get(product.id) ?? DEFAULT_LOW_STOCK_THRESHOLD;
    const status = computeStockStatus(product.quantity, threshold);
    if (status === "out") outOfStockCount++;
    else if (status === "low") lowStockCount++;
  }

  const totalOrders = allOrders.length;
  const totalRevenue = allOrders
    .filter((o) => (FULFILLED_STATUSES as readonly string[]).includes(o.status))
    .reduce((sum, o) => sum + Number(o.total), 0);

  const byDay = new Map<string, number>();
  for (let i = 0; i < SALES_CHART_DAYS; i++) {
    const day = new Date(chartFrom);
    day.setDate(day.getDate() + i);
    byDay.set(day.toISOString().slice(0, 10), 0);
  }
  for (const order of chartOrders) {
    if (!(FULFILLED_STATUSES as readonly string[]).includes(order.status)) continue;
    const day = order.createdAt.toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + Number(order.total));
  }
  const salesChart = [...byDay.entries()].map(([date, revenue]) => ({ date, revenue }));

  return {
    productCount,
    lowStockCount,
    outOfStockCount,
    customerCount,
    totalOrders,
    totalRevenue,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    recentOrders,
    salesChart,
  };
}

export type RecentOrder = Awaited<ReturnType<typeof getDashboardStats>>["recentOrders"][number];
