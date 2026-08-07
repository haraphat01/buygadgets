import type { NextConfig } from "next";

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Dev-only convenience: localhost isn't resolving on this machine right
  // now, so the dev server is being accessed via its LAN IP instead. This
  // silences the resulting cross-origin HMR warning; it's not a fix for
  // the underlying localhost/DNS issue. Safe to remove once localhost
  // works again — the IP is DHCP-assigned and may change.
  allowedDevOrigins: ["127.161.104.66"],
  images: {
    remotePatterns: [
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      // Seed catalog product photos (see prisma/seed-catalog.ts).
      {
        protocol: "https" as const,
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
