import { Suspense } from "react";

import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { CartCountBadge } from "@/components/storefront/cart-count-badge";
import { CompareCountBadge } from "@/components/storefront/compare-count-badge";
import { WishlistCountBadge } from "@/components/storefront/wishlist-count-badge";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* CartCountBadge/CompareCountBadge/WishlistCountBadge read guest-session
          cookies or the auth session — runtime APIs. Suspense isolates that
          to just the badges, so this layout (and every static page under
          it) doesn't get dragged into fully dynamic rendering. */}
      <SiteHeader
        cartBadge={<Suspense fallback={null}><CartCountBadge /></Suspense>}
        compareBadge={<Suspense fallback={null}><CompareCountBadge /></Suspense>}
        wishlistBadge={<Suspense fallback={null}><WishlistCountBadge /></Suspense>}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
