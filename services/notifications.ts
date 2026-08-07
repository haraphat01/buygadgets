import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@/generated/prisma/client";

// Admin-facing notification types (spec: New Order, Low Stock, Out of
// Stock, New Review). The rest of NotificationType is customer-facing and
// unused today — there are no customer accounts to attach them to.
const ADMIN_NOTIFICATION_TYPES: NotificationType[] = [
  "NEW_ORDER",
  "LOW_STOCK",
  "OUT_OF_STOCK",
  "NEW_REVIEW",
];

// Admin notifications are broadcast (profileId: null) rather than
// per-admin — there's no per-user targeting concept elsewhere in the admin
// panel either, matching the "user management only, no fine-grained RBAC"
// scope already chosen for Users.
export function getAdminNotifications() {
  return prisma.notification.findMany({
    where: { profileId: null, type: { in: ADMIN_NOTIFICATION_TYPES } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export function getUnreadAdminNotificationCount() {
  return prisma.notification.count({
    where: { profileId: null, type: { in: ADMIN_NOTIFICATION_TYPES }, read: false },
  });
}

export type AdminNotification = Awaited<ReturnType<typeof getAdminNotifications>>[number];
