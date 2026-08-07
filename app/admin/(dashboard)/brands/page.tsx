import type { Metadata } from "next";

import { listBrands } from "@/services/brands";
import { BrandsClient } from "@/components/admin/brands/brands-client";

export const metadata: Metadata = {
  title: "Brands",
};

export default async function BrandsPage() {
  const brands = await listBrands();

  return <BrandsClient brands={brands} />;
}
