import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getProductBySlug, getRelatedProducts } from "@/services/storefront-products";
import { getCompareProductIds } from "@/services/compare";
import { getWishlistProductIds } from "@/services/wishlist";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductDetailInfo } from "@/components/storefront/product-detail-info";
import { ProductReviews } from "@/components/storefront/product-reviews";
import { ProductSection } from "@/components/storefront/product-section";

// Not Suspense-deferred like /products: notFound() only sets a real HTTP
// 404 status if it fires before the response starts streaming. Since a
// wrong product slug needs to be a genuine 404 (SEO, crawlers, monitoring
// all care), this route trades away the static-shell benefit for that
// correctness — a worse tradeoff for /products, whose content is a shared
// shell across visitors rather than one specific product's page.
export const instant = false;

export async function generateMetadata(
  props: PageProps<"/products/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? "Product" };
}

export default async function ProductDetailPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const [related, compareIds, wishlistIds] = await Promise.all([
    product.categoryId ? getRelatedProducts(product.categoryId, product.id) : Promise.resolve([]),
    getCompareProductIds(),
    getWishlistProductIds(),
  ]);

  return (
    <div>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-6 md:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />
        <ProductDetailInfo
          product={product}
          isComparing={compareIds.includes(product.id)}
          isWishlisted={wishlistIds.includes(product.id)}
        />
      </div>

      <ProductSection title="Related Products" products={related} />
      <ProductReviews reviews={product.reviews} />
    </div>
  );
}
