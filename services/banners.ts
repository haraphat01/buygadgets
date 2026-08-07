import { prisma } from "@/lib/prisma";
import type { BANNER_POSITIONS } from "@/lib/validations/banner";

export function listBanners(position: (typeof BANNER_POSITIONS)[number]) {
  return prisma.banner.findMany({
    where: { position },
    orderBy: { createdAt: "desc" },
  });
}

export type BannerListItem = Awaited<ReturnType<typeof listBanners>>[number];
