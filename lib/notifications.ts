import "server-only";

import { prisma } from "@/lib/prisma";
import { computeStockStatus, DEFAULT_LOW_STOCK_THRESHOLD } from "@/lib/inventory-status";
import type { NotificationType } from "@/generated/prisma/client";

// Accepts either the top-level `prisma` client or a `$transaction` callback's
// `tx` client — both satisfy this structurally, letting callers write the
// notification atomically alongside the order/stock change it describes.
type NotificationClient = { notification: typeof prisma.notification };
type StockClient = NotificationClient & { inventory: typeof prisma.inventory };

export async function notifyAdmins(
  client: NotificationClient,
  type: NotificationType,
  title: string,
  message: string,
) {
  await client.notification.create({ data: { type, title, message } });
}

/// Only notifies when stock newly crosses into "low" or "out" — not on
/// every subsequent order against a product that's already low, which
/// would spam the admin inbox.
export async function notifyIfStockCrossedThreshold(
  client: StockClient,
  {
    productId,
    productName,
    previousQuantity,
    newQuantity,
  }: { productId: string; productName: string; previousQuantity: number; newQuantity: number },
) {
  const inventory = await client.inventory.findFirst({ where: { productId, variantId: null } });
  const threshold = inventory?.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD;

  const previousStatus = computeStockStatus(previousQuantity, threshold);
  const newStatus = computeStockStatus(newQuantity, threshold);
  if (previousStatus === newStatus) return;

  if (newStatus === "out") {
    await notifyAdmins(client, "OUT_OF_STOCK", "Out of stock", `${productName} is now out of stock.`);
  } else if (newStatus === "low") {
    await notifyAdmins(
      client,
      "LOW_STOCK",
      "Low stock warning",
      `${productName} has ${newQuantity} unit(s) left.`,
    );
  }
}
