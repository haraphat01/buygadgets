import type { Metadata } from "next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin Login",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">BuyGadgets Admin</CardTitle>
          <CardDescription>Sign in to manage the store.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
