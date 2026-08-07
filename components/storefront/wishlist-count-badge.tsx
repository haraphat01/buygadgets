import { getWishlistProductIds } from "@/services/wishlist";

// Mirrors CartCountBadge/CompareCountBadge — its own tiny async Server
// Component behind a <Suspense> boundary so the auth check doesn't drag
// the rest of the header into dynamic rendering.
export async function WishlistCountBadge() {
  const ids = await getWishlistProductIds();
  if (ids.length === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background">
      {ids.length > 9 ? "9+" : ids.length}
    </span>
  );
}
