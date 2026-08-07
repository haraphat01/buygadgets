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
import type { CustomersReportRow } from "@/services/reports";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function CustomersReportSection({ rows }: { rows: CustomersReportRow[] }) {
  const exportRows = rows.map((row) => ({
    ...row,
    joined: row.createdAt.toLocaleDateString(),
  }));

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Customers</CardTitle>
        <ExportCsvButton
          rows={exportRows}
          filename="customers-report.csv"
          columns={[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "orderCount", label: "Orders" },
            { key: "totalSpend", label: "Total Spend" },
            { key: "joined", label: "Joined" },
          ]}
        />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spend</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                  No customers yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-muted-foreground">{row.email}</TableCell>
                  <TableCell>{row.orderCount}</TableCell>
                  <TableCell>{currency.format(row.totalSpend)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.createdAt.toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
