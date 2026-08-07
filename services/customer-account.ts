import "server-only";

import { prisma } from "@/lib/prisma";

export function getCustomerOrders(customerId: string) {
  return prisma.order.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
}

export function getCustomerOrderById(customerId: string, orderId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, customerId },
    include: {
      items: true,
      payments: { orderBy: { createdAt: "desc" } },
      deliveryMethod: true,
    },
  });
}

export function getCustomerAddresses(customerId: string) {
  return prisma.address.findMany({
    where: { customerId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export type CustomerOrder = Awaited<ReturnType<typeof getCustomerOrders>>[number];
export type CustomerAddress = Awaited<ReturnType<typeof getCustomerAddresses>>[number];
