import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getProductById } from "@/services/products";
import { listCategories } from "@/services/categories";
import { listBrands } from "@/services/brands";
import { ProductForm } from "@/components/admin/products/product-form";

export const metadata: Metadata = {
  title: "Edit Product",
};

export default async function EditProductPage(
  props: PageProps<"/admin/products/[id]">,
) {
  const { id } = await props.params;
  const [product, categories, brands] = await Promise.all([
    getProductById(id),
    listCategories(),
    listBrands(),
  ]);

  if (!product) notFound();

  return (
    <ProductForm
      mode="edit"
      product={product}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      brands={brands.map((b) => ({ id: b.id, name: b.name }))}
    />
  );
}
