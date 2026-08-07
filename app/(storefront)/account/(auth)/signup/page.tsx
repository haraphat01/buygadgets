import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Create Account",
};

export const instant = false;

export default async function SignupPage(props: PageProps<"/account/signup">) {
  const searchParams = await props.searchParams;
  const email = typeof searchParams.email === "string" ? searchParams.email : "";

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-4 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Create Account</CardTitle>
          <CardDescription>Track orders, save addresses, and use your wishlist.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm defaultEmail={email} />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/account/login" className="font-medium text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
