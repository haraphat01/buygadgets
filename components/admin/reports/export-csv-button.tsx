"use client";

import { Download } from "lucide-react";

import { toCsv, type CsvColumn } from "@/lib/csv";
import { Button } from "@/components/ui/button";

export function ExportCsvButton<T>({
  rows,
  columns,
  filename,
}: {
  rows: T[];
  columns: CsvColumn<T>[];
  filename: string;
}) {
  function handleExport() {
    const csv = toCsv(rows, columns);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={rows.length === 0}>
      <Download className="size-4" />
      Export CSV
    </Button>
  );
}
