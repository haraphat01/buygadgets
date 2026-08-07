import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/// Refreshes the Supabase auth session on every request and does an
/// optimistic redirect for unauthenticated `/admin/*` and `/account/*`
/// access. This is not a substitute for real authorization checks in
/// Server Components/Actions — see Project.md "Security" (protected admin
/// routes, role based auth) and lib/auth.ts / lib/customer-auth.ts.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isAdminLoginRoute = request.nextUrl.pathname === "/admin/login";

  if (isAdminRoute && !isAdminLoginRoute && !user) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminLoginRoute && user) {
    const dashboardUrl = new URL("/admin", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  const isAccountRoute = request.nextUrl.pathname.startsWith("/account");
  const isAccountAuthRoute =
    request.nextUrl.pathname === "/account/login" ||
    request.nextUrl.pathname === "/account/signup" ||
    request.nextUrl.pathname.startsWith("/account/reset-password");

  if (isAccountRoute && !isAccountAuthRoute && !user) {
    const loginUrl = new URL("/account/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if ((request.nextUrl.pathname === "/account/login" || request.nextUrl.pathname === "/account/signup") && user) {
    const accountUrl = new URL("/account", request.url);
    return NextResponse.redirect(accountUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
