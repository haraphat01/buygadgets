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

export default async function HomePage() {
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
