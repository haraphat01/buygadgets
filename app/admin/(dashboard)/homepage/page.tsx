import type { Metadata } from "next";

import { listBanners } from "@/services/banners";
import {
  listCategoriesForPicker,
  listFlashSaleProducts,
  listProductsForPicker,
} from "@/services/homepage";
import { BannerSection } from "@/components/admin/homepage/banner-section";
import { FeaturedProductsSection } from "@/components/admin/homepage/featured-products-section";
import { FeaturedCategoriesSection } from "@/components/admin/homepage/featured-categories-section";
import { FlashSalesSection } from "@/components/admin/homepage/flash-sales-section";

export const metadata: Metadata = {
  title: "Homepage Manager",
};

export default async function HomepageManagerPage() {
  const [heroBanners, promoBanners, products, categories, flashSales] = await Promise.all([
    listBanners("hero"),
    listBanners("promotion"),
    listProductsForPicker(),
    listCategoriesForPicker(),
    listFlashSaleProducts(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold tracking-tight">Homepage Manager</h1>

      <BannerSection title="Hero Banners" position="hero" banners={heroBanners} />
      <BannerSection title="Promotions" position="promotion" banners={promoBanners} />
      <FlashSalesSection flashSales={flashSales} products={products} />
      <FeaturedProductsSection products={products} />
      <FeaturedCategoriesSection categories={categories} />
    </div>
  );
}
