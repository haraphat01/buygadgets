"use client";

import { useState } from "react";
import Image from "next/image";
import { MoreHorizontal, Plus } from "lucide-react";

import { deleteBanner } from "@/actions/banners";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { BannerDialog } from "@/components/admin/homepage/banner-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { BANNER_POSITIONS } from "@/lib/validations/banner";
import type { BannerListItem } from "@/services/banners";

export function BannerSection({
  title,
  position,
  banners,
}: {
  title: string;
  position: (typeof BANNER_POSITIONS)[number];
  banners: BannerListItem[];
}) {
  const [dialogBanner, setDialogBanner] = useState<BannerListItem | null | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<BannerListItem | null>(null);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        <Button size="sm" onClick={() => setDialogBanner(null)}>
          <Plus className="size-4" />
          New Banner
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20" />
              <TableHead>Title</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                  No banners yet.
                </TableCell>
              </TableRow>
            ) : (
              banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <div className="flex h-10 w-16 items-center justify-center overflow-hidden rounded-md border bg-muted">
                      <Image
                        src={banner.imageUrl}
                        alt=""
                        width={64}
                        height={40}
                        className="size-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{banner.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {banner.startDate || banner.endDate
                      ? `${banner.startDate ? new Date(banner.startDate).toLocaleDateString() : "—"} → ${
                          banner.endDate ? new Date(banner.endDate).toLocaleDateString() : "—"
                        }`
                      : "Always shown"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={banner.active ? "default" : "outline"}>
                      {banner.active ? "Active" : "Inactive"}
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
                        <DropdownMenuItem onClick={() => setDialogBanner(banner)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteTarget(banner)}
                        >
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
      </CardContent>

      <BannerDialog
        open={dialogBanner !== undefined}
        onOpenChange={(open) => !open && setDialogBanner(undefined)}
        banner={dialogBanner}
        position={position}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.title}"?`}
        description="This can't be undone."
        onConfirm={() => deleteBanner(deleteTarget!.id)}
      />
    </Card>
  );
}
