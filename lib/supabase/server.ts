import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/// Server-side Supabase client scoped to the current request's cookies.
/// Call `await createClient()` inside a Server Component, Server Action,
/// or Route Handler — not at module scope.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component with no request context to
            // write to — safe to ignore as long as `proxy.ts` also
            // refreshes the session.
          }
        },
      },
    },
  );
}
