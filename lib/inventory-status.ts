export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export type StockStatus = "in_stock" | "low" | "out";

export function computeStockStatus(quantity: number, threshold: number): StockStatus {
  if (quantity === 0) return "out";
  if (quantity <= threshold) return "low";
  return "in_stock";
}
