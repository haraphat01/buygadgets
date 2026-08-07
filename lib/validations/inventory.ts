import { z } from "zod";

export const adjustStockSchema = z.object({
  productId: z.string().uuid(),
  newQuantity: z.coerce.number().int().nonnegative(),
  threshold: z.coerce.number().int().nonnegative(),
  reason: z.string().optional(),
});

export type AdjustStockValues = z.infer<typeof adjustStockSchema>;
export type AdjustStockFormInput = z.input<typeof adjustStockSchema>;
