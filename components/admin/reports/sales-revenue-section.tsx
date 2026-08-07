import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExportCsvButton } from "@/components/admin/reports/export-csv-button";
import type { getSalesRevenueReport } from "@/services/reports";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function SalesRevenueSection({
  report,
}: {
  report: Awaited<ReturnType<typeof getSalesRevenueReport>>;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Sales & Revenue</CardTitle>
        <ExportCsvButton
          rows={report.daily}
          filename="sales-revenue.csv"
          columns={[
            { key: "date", label: "Date" },
            { key: "orders", label: "Orders" },
            { key: "revenue", label: "Revenue" },
          ]}
        />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-3">
            <CardDescription>Orders</CardDescription>
            <p className="text-2xl font-semibold tracking-tight">{report.totalOrders}</p>
          </div>
          <div className="rounded-lg border p-3">
            <CardDescription>Revenue</CardDescription>
            <p className="text-2xl font-semibold tracking-tight">
              {currency.format(report.totalRevenue)}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <CardDescription>Avg. order value</CardDescription>
            <p className="text-2xl font-semibold tracking-tight">
              {currency.format(report.averageOrderValue)}
            </p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.daily.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-20 text-center text-muted-foreground">
                  No orders in this range.
                </TableCell>
              </TableRow>
            ) : (
              report.daily.map((day) => (
                <TableRow key={day.date}>
                  <TableCell>{day.date}</TableCell>
                  <TableCell>{day.orders}</TableCell>
                  <TableCell>{currency.format(day.revenue)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
