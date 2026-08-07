import { prisma } from "@/lib/prisma";

export function listCoupons() {
  return prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });
}

export type CouponListItem = Awaited<ReturnType<typeof listCoupons>>[number];
