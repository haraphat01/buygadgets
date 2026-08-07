import type { Metadata } from "next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestResetForm } from "./request-reset-form";

export const metadata: Metadata = {
  title: "Reset Password",
};

export const instant = false;

export default function RequestResetPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-4 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription>Enter your email and we&apos;ll send you a reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <RequestResetForm />
        </CardContent>
      </Card>
    </div>
  );
}
