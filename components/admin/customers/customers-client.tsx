"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { deleteCustomer, toggleCustomerDisabled } from "@/actions/customers";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  CustomerListItem,
  CustomerStatusFilter,
  CustomerTypeFilter,
} from "@/services/customers";
import type { PaginatedResult } from "@/types";

export function CustomersClient({
  result,
  q,
  type,
  status,
}: {
  result: PaginatedResult<CustomerListItem>;
  q: string;
  type: CustomerTypeFilter;
  status: CustomerStatusFilter;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(q);
  const [deleteTarget, setDeleteTarget] = useState<CustomerListItem | null>(null);
  const [, startTransition] = useTransition();

  function updateParams(patch: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search !== q) updateParams({ q: search || undefined, page: undefined });
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function handleToggleDisabled(customer: CustomerListItem) {
    startTransition(async () => {
      const result = await toggleCustomerDisabled(customer.id, !customer.disabled);
      if (!result.success) toast.error(result.error);
      else toast.success(customer.disabled ? "Customer enabled." : "Customer disabled.");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold tracking-tight">Customers</h1>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={type}
          onValueChange={(value) =>
            updateParams({ type: value === "all" ? undefined : (value as string), page: undefined })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="guest">Guest</SelectItem>
            <SelectItem value="registered">Registered</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(value) =>
            updateParams({ status: value === "all" ? undefined : (value as string), page: undefined })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              result.items.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/customers/${customer.id}`} className="hover:underline">
                      {customer.firstName} {customer.lastName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                  <TableCell className="text-muted-foreground">{customer.phone ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={customer.isGuest ? "outline" : "secondary"}>
                      {customer.isGuest ? "Guest" : "Registered"}
                    </Badge>
                  </TableCell>
                  <TableCell>{customer._count.orders}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.disabled ? "destructive" : "default"}>
                      {customer.disabled ? "Disabled" : "Active"}
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
                          render={<Link href={`/admin/customers/${customer.id}`} />}
                        >
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleDisabled(customer)}>
                          {customer.disabled ? "Enable" : "Disable"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteTarget(customer)}
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
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Page {result.page} of {result.totalPages} ({result.total} customers)
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={result.page <= 1}
            onClick={() => updateParams({ page: String(result.page - 1) })}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={result.page >= result.totalPages}
            onClick={() => updateParams({ page: String(result.page + 1) })}
          >
            Next
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.firstName} ${deleteTarget?.lastName}"?`}
        description="Their orders are kept (unlinked from this customer). Their addresses, cart, wishlist, and reviews are permanently removed. This can't be undone."
        onConfirm={() => deleteCustomer(deleteTarget!.id)}
      />
    </div>
  );
}
