import type { Metadata } from "next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Set New Password",
};

export const instant = false;

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-4 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Set New Password</CardTitle>
          <CardDescription>Choose a new password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
