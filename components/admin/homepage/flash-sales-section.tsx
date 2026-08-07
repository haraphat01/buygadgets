"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";

import { endFlashSale } from "@/actions/homepage";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { StartFlashSaleDialog } from "@/components/admin/homepage/start-flash-sale-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FlashSaleListItem, ProductPickerItem } from "@/services/homepage";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function FlashSalesSection({
  flashSales,
  products,
}: {
  flashSales: FlashSaleListItem[];
  products: ProductPickerItem[];
}) {
  const [startOpen, setStartOpen] = useState(false);
  const [endTarget, setEndTarget] = useState<FlashSaleListItem | null>(null);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Flash Sales</CardTitle>
        <Button size="sm" onClick={() => setStartOpen(true)}>
          <Plus className="size-4" />
          Start Flash Sale
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14" />
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Sale Price</TableHead>
              <TableHead>Ends</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {flashSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
                  No active flash sales.
                </TableCell>
              </TableRow>
            ) : (
              flashSales.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex size-9 items-center justify-center overflow-hidden rounded-md border bg-muted">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0].url}
                          alt=""
                          width={36}
                          height={36}
                          className="size-full object-cover"
                        />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground line-through">
                    {currency.format(Number(product.price))}
                  </TableCell>
                  <TableCell>{currency.format(Number(product.discountPrice))}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.flashSaleEndsAt ? new Date(product.flashSaleEndsAt).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => setEndTarget(product)}>
                      End Sale
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <StartFlashSaleDialog open={startOpen} onOpenChange={setStartOpen} products={products} />

      <ConfirmDialog
        open={!!endTarget}
        onOpenChange={(open) => !open && setEndTarget(null)}
        title={`End flash sale on "${endTarget?.name}"?`}
        description="The product's price reverts to its regular price."
        confirmLabel="End Sale"
        onConfirm={() => endFlashSale(endTarget!.id)}
      />
    </Card>
  );
}
