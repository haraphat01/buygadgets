import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

export async function listAdminUsers() {
  const [adminUsers, { data, error }] = await Promise.all([
    prisma.adminUser.findMany({
      include: { profile: true },
      orderBy: { createdAt: "asc" },
    }),
    createAdminClient().auth.admin.listUsers(),
  ]);

  if (error) throw error;
  const emailById = new Map(data.users.map((u) => [u.id, u.email ?? ""]));

  return adminUsers.map((adminUser) => ({
    ...adminUser,
    email: emailById.get(adminUser.profileId) ?? "",
  }));
}

export type AdminUserListItem = Awaited<ReturnType<typeof listAdminUsers>>[number];
