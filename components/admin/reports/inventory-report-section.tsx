import { Badge } from "@/components/ui/badge";
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
import type { InventoryReportRow } from "@/services/reports";

function StatusBadge({ status }: { status: InventoryReportRow["status"] }) {
  if (status === "out") return <Badge variant="destructive">Out of Stock</Badge>;
  if (status === "low") return <Badge variant="secondary">Low Stock</Badge>;
  return <Badge variant="outline">In Stock</Badge>;
}

export function InventoryReportSection({ rows }: { rows: InventoryReportRow[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Inventory</CardTitle>
        <ExportCsvButton
          rows={rows}
          filename="inventory-report.csv"
          columns={[
            { key: "name", label: "Product" },
            { key: "sku", label: "SKU" },
            { key: "quantity", label: "Quantity" },
            { key: "threshold", label: "Low Stock Threshold" },
            { key: "status", label: "Status" },
          ]}
        />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Threshold</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                  No products yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-muted-foreground">{row.sku}</TableCell>
                  <TableCell>{row.quantity}</TableCell>
                  <TableCell>{row.threshold}</TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
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
