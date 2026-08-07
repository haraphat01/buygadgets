import type { Metadata } from "next";
import Link from "next/link";

import { getCompareProducts, MAX_COMPARE_ITEMS } from "@/services/compare";
import { CompareTable } from "@/components/storefront/compare-table";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Compare Products",
};

// Private, per-visitor content (reads the guest session cookie) — same
// reasoning as /cart.
export const instant = false;

export default async function ComparePage() {
  const products = await getCompareProducts();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Compare Products</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Compare up to {MAX_COMPARE_ITEMS} products side by side.
      </p>

      {products.length === 0 ? (
        <div className="rounded-xl border py-16 text-center">
          <p className="text-muted-foreground">You haven&apos;t added any products to compare yet.</p>
          <Button className="mt-4" render={<Link href="/products" />}>
            Browse Products
          </Button>
        </div>
      ) : (
        <CompareTable products={products} />
      )}
    </div>
  );
}
