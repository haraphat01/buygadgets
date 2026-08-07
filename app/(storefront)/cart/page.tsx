import type { Metadata } from "next";

import { getCart } from "@/services/cart";
import { CartView } from "@/components/storefront/cart-view";

export const metadata: Metadata = {
  title: "Your Cart",
};

// Private, per-visitor content (reads the cart session cookie) — nothing
// to statically shell here, same reasoning as the product detail page.
export const instant = false;

export default async function CartPage() {
  const cart = await getCart();
  return <CartView cart={cart} />;
}
