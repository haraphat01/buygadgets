import "server-only";

import { prisma } from "@/lib/prisma";

export function getActiveDeliveryMethods() {
  return prisma.deliveryMethod.findMany({
    where: { active: true },
    orderBy: { fee: "asc" },
  });
}

export function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
      deliveryMethod: true,
      customer: { select: { isGuest: true } },
    },
  });
}
