import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/// Exchanges a Supabase auth link's code (password recovery today) for a
/// session, then redirects to `next`. Needed because the recovery email is
/// sent by us via Resend (see actions/customer-auth.ts's
/// requestPasswordReset) rather than by Supabase, but the link itself
/// still goes through Supabase's PKCE code-exchange flow.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, origin));
}
