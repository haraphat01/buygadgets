import type { Metadata } from "next";

import { getStockActivity, listInventory, type InventoryStatusFilter } from "@/services/inventory";
import { InventoryClient } from "@/components/admin/inventory/inventory-client";

export const metadata: Metadata = {
  title: "Inventory",
};

export default async function InventoryPage(props: PageProps<"/admin/inventory">) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const status: InventoryStatusFilter =
    searchParams.status === "in_stock" ||
    searchParams.status === "low" ||
    searchParams.status === "out"
      ? searchParams.status
      : "all";
  const page = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1;

  const [result, activity] = await Promise.all([
    listInventory({ q, page, status, pageSize: 20 }),
    getStockActivity({ take: 20 }),
  ]);

  return <InventoryClient result={result} activity={activity} q={q} status={status} />;
}
