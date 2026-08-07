import type { Metadata } from "next";

import {
  getCustomersReport,
  getInventoryReport,
  getProductsReport,
  getSalesRevenueReport,
} from "@/services/reports";
import { DateRangePicker } from "@/components/admin/reports/date-range-picker";
import { SalesRevenueSection } from "@/components/admin/reports/sales-revenue-section";
import { ProductsReportSection } from "@/components/admin/reports/products-report-section";
import { InventoryReportSection } from "@/components/admin/reports/inventory-report-section";
import { CustomersReportSection } from "@/components/admin/reports/customers-report-section";

export const metadata: Metadata = {
  title: "Reports",
};

function parseDate(value: string | undefined, fallback: Date) {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

export default async function ReportsPage(props: PageProps<"/admin/reports">) {
  const searchParams = await props.searchParams;

  const defaultTo = new Date();
  const defaultFrom = new Date(defaultTo);
  defaultFrom.setDate(defaultFrom.getDate() - 30);

  const fromParam = typeof searchParams.from === "string" ? searchParams.from : undefined;
  const toParam = typeof searchParams.to === "string" ? searchParams.to : undefined;
  const from = parseDate(fromParam, defaultFrom);
  const to = parseDate(toParam, defaultTo);

  const [salesRevenue, productsReport, inventoryReport, customersReport] = await Promise.all([
    getSalesRevenueReport({ from, to }),
    getProductsReport({ from, to }),
    getInventoryReport(),
    getCustomersReport(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold tracking-tight">Reports</h1>
        <DateRangePicker
          from={fromParam ?? defaultFrom.toISOString().slice(0, 10)}
          to={toParam ?? defaultTo.toISOString().slice(0, 10)}
        />
      </div>

      <SalesRevenueSection report={salesRevenue} />
      <ProductsReportSection rows={productsReport} />
      <InventoryReportSection rows={inventoryReport} />
      <CustomersReportSection rows={customersReport} />
    </div>
  );
}
