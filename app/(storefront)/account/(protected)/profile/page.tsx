import type { Metadata } from "next";

import { getCustomerSession } from "@/lib/customer-auth";
import { ProfileForm } from "./profile-form";
import { ChangePasswordForm } from "./change-password-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const session = await getCustomerSession();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold tracking-tight">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            defaultValues={{
              firstName: session.customer.firstName,
              lastName: session.customer.lastName,
              phone: session.customer.phone ?? "",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
