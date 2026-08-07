import { createClient } from "@supabase/supabase-js";

/// Service-role client for privileged, server-only operations (bypasses
/// Row Level Security). Never import this into client components or
/// anything reachable from the browser bundle.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
