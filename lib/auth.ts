import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

/// Secure (DB-backed) admin auth check — the single source of truth for
/// every protected admin page/layout/Server Action. Redirects to
/// /admin/login if there's no session, or if the session belongs to a
/// Supabase user that isn't an admin. Memoized per request with `cache()`
/// so calling it from a layout and a page doesn't duplicate the query.
export const getAdminSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: { profileId: user.id },
    include: { profile: true },
  });

  if (!adminUser) {
    redirect("/admin/login");
  }

  return { authUserId: user.id, email: user.email, adminUser };
});
