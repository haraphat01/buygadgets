import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExportCsvButton } from "@/components/admin/reports/export-csv-button";
import type { ProductsReportRow } from "@/services/reports";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function ProductsReportSection({ rows }: { rows: ProductsReportRow[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Top Selling Products</CardTitle>
        <ExportCsvButton
          rows={rows}
          filename="products-report.csv"
          columns={[
            { key: "name", label: "Product" },
            { key: "unitsSold", label: "Units Sold" },
            { key: "revenue", label: "Revenue" },
          ]}
        />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Units Sold</TableHead>
              <TableHead>Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-20 text-center text-muted-foreground">
                  No sales in this range.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.name}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.unitsSold}</TableCell>
                  <TableCell>{currency.format(row.revenue)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
