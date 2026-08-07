"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { deleteAdminUser, updateAdminUserRole } from "@/actions/admin-users";
import { ASSIGNABLE_ROLES } from "@/lib/validations/admin-user";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { AdminUserDialog } from "@/components/admin/users/admin-user-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { AdminUserListItem } from "@/services/admin-users";

export function UsersClient({ adminUsers }: { adminUsers: AdminUserListItem[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserListItem | null>(null);
  const [, startTransition] = useTransition();

  function handleRoleChange(user: AdminUserListItem, role: string) {
    startTransition(async () => {
      const result = await updateAdminUserRole(user.id, role as "ADMIN" | "STAFF");
      if (!result.success) toast.error(result.error);
      else toast.success("Role updated.");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Users</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          New User
        </Button>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {adminUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.profile.fullName ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  {user.role === "OWNER" ? (
                    <Badge>Owner</Badge>
                  ) : (
                    <Select value={user.role} onValueChange={(v) => handleRoleChange(user, v as string)}>
                      <SelectTrigger size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSIGNABLE_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role.charAt(0) + role.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {user.role !== "OWNER" ? (
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(user)}>
                      Delete
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AdminUserDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.profile.fullName ?? deleteTarget?.email}"?`}
        description="This removes their login and admin access. This can't be undone."
        onConfirm={() => deleteAdminUser(deleteTarget!.id)}
      />
    </div>
  );
}
