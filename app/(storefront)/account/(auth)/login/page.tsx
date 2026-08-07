import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign In",
};

export const instant = false;

export default function AccountLoginPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-4 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Sign In</CardTitle>
          <CardDescription>Sign in to track orders and manage your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/account/reset-password/request" className="hover:underline">
              Forgot your password?
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/account/signup" className="font-medium text-foreground hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
