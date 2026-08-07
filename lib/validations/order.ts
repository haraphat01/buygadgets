import { z } from "zod";

export const ORDER_STATUSES = [
  "PENDING",
  "AWAITING_PAYMENT",
  "PAID",
  "PROCESSING",
  "READY_FOR_PICKUP",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  trackingNumber: z.string().optional(),
});

export type UpdateOrderStatusValues = z.infer<typeof updateOrderStatusSchema>;
