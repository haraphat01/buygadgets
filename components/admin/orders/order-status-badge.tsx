import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/generated/prisma/client";

const LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  AWAITING_PAYMENT: "Awaiting Payment",
  PAID: "Paid",
  PROCESSING: "Processing",
  READY_FOR_PICKUP: "Ready for Pickup",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

const VARIANTS: Record<OrderStatus, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "outline",
  AWAITING_PAYMENT: "outline",
  PAID: "secondary",
  PROCESSING: "secondary",
  READY_FOR_PICKUP: "secondary",
  SHIPPED: "secondary",
  DELIVERED: "default",
  CANCELLED: "destructive",
  REFUNDED: "destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
