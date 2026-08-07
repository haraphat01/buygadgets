"use client";

import { useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";

import { deleteAddress } from "@/actions/customer-account";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddressDialog } from "./address-dialog";
import type { CustomerAddress } from "@/services/customer-account";

export function AddressesClient({ addresses }: { addresses: CustomerAddress[] }) {
  const [dialogAddress, setDialogAddress] = useState<CustomerAddress | null | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<CustomerAddress | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Addresses</h1>
        <Button onClick={() => setDialogAddress(null)}>
          <Plus className="size-4" />
          New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No saved addresses yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardContent className="flex items-start justify-between gap-2 py-4 text-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{address.label || "Address"}</span>
                    {address.isDefault ? <Badge variant="outline">Default</Badge> : null}
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {address.firstName} {address.lastName} · {address.phone}
                  </p>
                  <p className="text-muted-foreground">
                    {address.address}, {address.city}, {address.state}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setDialogAddress(address)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(address)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddressDialog
        open={dialogAddress !== undefined}
        onOpenChange={(open) => !open && setDialogAddress(undefined)}
        address={dialogAddress}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this address?"
        description="This can't be undone."
        onConfirm={() => deleteAddress(deleteTarget!.id)}
      />
    </div>
  );
}
