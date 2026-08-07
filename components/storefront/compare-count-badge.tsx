import { getCompareProductIds } from "@/services/compare";

// Mirrors CartCountBadge — its own tiny async Server Component behind a
// <Suspense> boundary so the cookie read doesn't drag the rest of the
// header (and every static-shelled page under it) into dynamic rendering.
export async function CompareCountBadge() {
  const ids = await getCompareProductIds();
  if (ids.length === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background">
      {ids.length}
    </span>
  );
}
