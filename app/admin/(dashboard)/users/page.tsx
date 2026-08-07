import type { Metadata } from "next";

import { getAdminSession } from "@/lib/auth";
import { listAdminUsers } from "@/services/admin-users";
import { UsersClient } from "@/components/admin/users/users-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Users",
};

export default async function UsersPage() {
  const session = await getAdminSession();

  if (session.adminUser.role !== "OWNER") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Owner access required</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Only the store Owner can manage admin accounts.
        </CardContent>
      </Card>
    );
  }

  const adminUsers = await listAdminUsers();

  return <UsersClient adminUsers={adminUsers} />;
}
