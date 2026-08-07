import type { Metadata } from "next";

import { listProducts, type ProductStatusFilter } from "@/services/products";
import { ProductsClient } from "@/components/admin/products/products-client";

export const metadata: Metadata = {
  title: "Products",
};

export default async function ProductsPage(props: PageProps<"/admin/products">) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const status: ProductStatusFilter =
    searchParams.status === "published" ||
    searchParams.status === "draft" ||
    searchParams.status === "archived"
      ? searchParams.status
      : "all";
  const page = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1;

  const result = await listProducts({ q, page, status, pageSize: 20 });

  return <ProductsClient result={result} q={q} status={status} />;
}
