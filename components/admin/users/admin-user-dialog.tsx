"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createAdminUser } from "@/actions/admin-users";
import {
  ASSIGNABLE_ROLES,
  createAdminUserSchema,
  type CreateAdminUserValues,
} from "@/lib/validations/admin-user";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdminUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New admin user</DialogTitle>
        </DialogHeader>
        {open ? <AdminUserForm key="new" onOpenChange={onOpenChange} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function AdminUserForm({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateAdminUserValues>({
    resolver: zodResolver(createAdminUserSchema),
    defaultValues: { email: "", password: "", fullName: "", role: "STAFF" },
  });

  function onSubmit(values: CreateAdminUserValues) {
    startTransition(async () => {
      const result = await createAdminUser(values);
      if (result.success) {
        toast.success("Admin user created.");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="admin-name">Full name</Label>
        <Input id="admin-name" {...register("fullName")} aria-invalid={!!errors.fullName} />
        {errors.fullName ? (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="admin-email">Email</Label>
        <Input id="admin-email" type="email" {...register("email")} aria-invalid={!!errors.email} />
        {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="admin-password">Temporary password</Label>
        <Input
          id="admin-password"
          type="password"
          {...register("password")}
          aria-invalid={!!errors.password}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Share this with them directly — there&apos;s no invite email yet.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Role</Label>
        <Select value={watch("role")} onValueChange={(v) => setValue("role", v as CreateAdminUserValues["role"])}>
          <SelectTrigger className="w-full">
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
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
}
