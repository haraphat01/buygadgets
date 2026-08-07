import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

/// Secure (DB-backed) customer auth check, mirroring lib/auth.ts's
/// getAdminSession() exactly — the single source of truth for every
/// protected /account page/Server Action. Redirects to /account/login if
/// there's no session, the session isn't a registered customer (e.g. it's
/// an admin's session), or the account has been disabled.
export const getCustomerSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  const customer = await prisma.customer.findUnique({
    where: { profileId: user.id },
  });

  if (!customer || customer.disabled) {
    await supabase.auth.signOut();
    redirect("/account/login");
  }

  return { authUserId: user.id, email: user.email, customer };
});

/// Non-redirecting variant for read-only contexts that need to render
/// differently for logged-in vs anonymous visitors (e.g. a wishlist count
/// badge in the header) without forcing a redirect just to check.
export const getOptionalCustomerSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const customer = await prisma.customer.findUnique({ where: { profileId: user.id } });
  if (!customer || customer.disabled) return null;

  return { authUserId: user.id, email: user.email, customer };
});
