import { getCartItemCount } from "@/services/cart";

// Deliberately its own tiny async Server Component, not folded into
// SiteHeader — reading the cart cookie is a runtime API, and isolating it
// behind a <Suspense> boundary (see SiteHeader) is what keeps the rest of
// the header, and every static-shelled page it sits on, from being dragged
// into fully dynamic rendering.
export async function CartCountBadge() {
  const count = await getCartItemCount();
  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background">
      {count > 9 ? "9+" : count}
    </span>
  );
}
