import type { Metadata } from "next";
import Link from "next/link";

import { getCustomerSession } from "@/lib/customer-auth";
import { getWishlistProducts } from "@/services/wishlist";
import { ProductCard } from "@/components/storefront/product-card";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Wishlist",
};

export default async function WishlistPage() {
  const session = await getCustomerSession();
  const products = await getWishlistProducts(session.customer.id);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold tracking-tight">Wishlist</h1>

      {products.length === 0 ? (
        <Card>
          <CardContent className="flex h-40 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
            <p>Your wishlist is empty.</p>
            <Button size="sm" render={<Link href="/products" />}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="relative">
              <div className="absolute top-2 right-2 z-10">
                <WishlistButton productId={product.id} initialIsWishlisted />
              </div>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
