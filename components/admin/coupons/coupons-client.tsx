"use client";

import { useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";

import { deleteCoupon } from "@/actions/coupons";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CouponDialog, type EditableCoupon } from "@/components/admin/coupons/coupon-dialog";
import { formatNaira } from "@/lib/currency";
import type { CouponListItem } from "@/services/coupons";

export function CouponsClient({ coupons }: { coupons: CouponListItem[] }) {
  const [dialogCoupon, setDialogCoupon] = useState<EditableCoupon | null | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<CouponListItem | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Coupons</h1>
        <Button onClick={() => setDialogCoupon(null)}>
          <Plus className="size-4" />
          New Coupon
        </Button>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Min. Spend</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No coupons yet.
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-medium">{coupon.code}</TableCell>
                  <TableCell>
                    {coupon.type === "PERCENTAGE" ? `${Number(coupon.value)}%` : formatNaira(Number(coupon.value))}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : "No expiry"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {coupon.usedCount}
                    {coupon.usageLimit !== null ? ` / ${coupon.usageLimit}` : ""}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {coupon.minimumSpend !== null ? formatNaira(Number(coupon.minimumSpend)) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.active ? "default" : "outline"}>
                      {coupon.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            setDialogCoupon({
                              id: coupon.id,
                              code: coupon.code,
                              type: coupon.type,
                              value: Number(coupon.value),
                              expiryDate: coupon.expiryDate,
                              usageLimit: coupon.usageLimit,
                              minimumSpend: coupon.minimumSpend !== null ? Number(coupon.minimumSpend) : null,
                              active: coupon.active,
                            })
                          }
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(coupon)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CouponDialog
        open={dialogCoupon !== undefined}
        onOpenChange={(open) => !open && setDialogCoupon(undefined)}
        coupon={dialogCoupon}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.code}"?`}
        description={
          deleteTarget && deleteTarget._count.orders > 0
            ? `This coupon has been used on ${deleteTarget._count.orders} order(s). Deleting it won't affect those orders.`
            : "This can't be undone."
        }
        onConfirm={() => deleteCoupon(deleteTarget!.id)}
      />
    </div>
  );
}
