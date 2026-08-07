"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";

import { logoutCustomer } from "@/actions/customer-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Orders", href: "/account/orders" },
  { label: "Wishlist", href: "/account/wishlist" },
  { label: "Addresses", href: "/account/addresses" },
  { label: "Profile", href: "/account/profile" },
];

export function AccountNav() {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-lg px-3 py-2 text-sm hover:bg-muted",
            pathname.startsWith(item.href) ? "bg-muted font-medium" : "text-muted-foreground",
          )}
        >
          {item.label}
        </Link>
      ))}
      <Button
        variant="ghost"
        className="justify-start px-3 text-muted-foreground"
        disabled={isPending}
        onClick={() => startTransition(async () => { await logoutCustomer(); })}
      >
        Sign out
      </Button>
    </nav>
  );
}
