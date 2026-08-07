import type { Metadata } from "next";

import { listCategories } from "@/services/categories";
import { listBrands } from "@/services/brands";
import { ProductForm } from "@/components/admin/products/product-form";

export const metadata: Metadata = {
  title: "New Product",
};

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([listCategories(), listBrands()]);

  return (
    <ProductForm
      mode="create"
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      brands={brands.map((b) => ({ id: b.id, name: b.name }))}
    />
  );
}
