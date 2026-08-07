import type { Metadata } from "next";

import { listCategories } from "@/services/categories";
import { CategoriesClient } from "@/components/admin/categories/categories-client";

export const metadata: Metadata = {
  title: "Categories",
};

export default async function CategoriesPage() {
  const categories = await listCategories();

  return <CategoriesClient categories={categories} />;
}
