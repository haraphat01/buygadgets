import { Suspense } from "react";
import { io } from "next/cache";

import {
  getActiveHeroBanners,
  getBestSellers,
  getFeaturedProducts,
  getFlashSaleProducts,
  getNewArrivals,
  getPopularBrands,
} from "@/services/storefront";
import { HeroCarousel } from "@/components/storefront/hero-carousel";
import { ProductSection } from "@/components/storefront/product-section";
import { BrandsSection } from "@/components/storefront/brands-section";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}

async function HomePageContent() {
  await io();

  const [heroBanners, flashSaleProducts, featuredProducts, newArrivals, bestSellers, brands] =
    await Promise.all([
      getActiveHeroBanners(),
      getFlashSaleProducts(),
      getFeaturedProducts(),
      getNewArrivals(),
      getBestSellers(),
      getPopularBrands(),
    ]);

  return (
    <div className="flex flex-col">
      <div className="mx-auto w-full max-w-6xl px-4 pt-6">
        <HeroCarousel banners={heroBanners} />
      </div>

      <ProductSection title="Featured Phones" products={featuredProducts} />
      <ProductSection
        title="Flash Sales"
        subtitle="Limited-time deals — grab them before they're gone."
        products={flashSaleProducts}
      />
      <ProductSection title="New Arrivals" products={newArrivals} />
      <ProductSection title="Best Sellers" products={bestSellers} />
      <BrandsSection brands={brands} />
    </div>
  );
}

function HomePageSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="mx-auto w-full max-w-6xl px-4 pt-6">
        <Skeleton className="aspect-[21/9] w-full rounded-xl sm:aspect-[3/1]" />
      </div>
      {[0, 1, 2, 3].map((section) => (
        <section key={section} className="mx-auto w-full max-w-6xl px-4 py-8">
          <Skeleton className="mb-4 h-7 w-40" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((card) => (
              <Skeleton key={card} className="aspect-square w-full" />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
