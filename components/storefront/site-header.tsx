"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Menu, Scale, ShoppingCart, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems: { label: string; href?: string }[] = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Categories" },
  { label: "Brands" },
];

export function SiteHeader({
  cartBadge,
  compareBadge,
  wishlistBadge,
}: {
  cartBadge: React.ReactNode;
  compareBadge: React.ReactNode;
  wishlistBadge: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          BuyGadgets
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {navItems.map((item) =>
            item.href ? (
              // No active-route highlighting here — usePathname() in this
              // shared layout component blocks the static shell on any
              // dynamic-segment page (e.g. /products/[slug]) under Cache
              // Components, which matters more here than the nicety does.
              <Button key={item.label} variant="ghost" size="sm" render={<Link href={item.href} />}>
                {item.label}
              </Button>
            ) : (
              <Button key={item.label} variant="ghost" size="sm" disabled>
                {item.label}
                <Badge variant="outline" className="ml-1.5 text-[10px] uppercase">
                  Soon
                </Badge>
              </Button>
            ),
          )}
        </nav>

        <div className="ml-auto hidden items-center gap-1 md:flex">
          <Button variant="ghost" size="icon" className="relative" render={<Link href="/account/wishlist" />}>
            <Heart className="size-4" />
            {wishlistBadge}
          </Button>
          <Button variant="ghost" size="icon" className="relative" render={<Link href="/compare" />}>
            <Scale className="size-4" />
            {compareBadge}
          </Button>
          <Button variant="ghost" size="icon" className="relative" render={<Link href="/cart" />}>
            <ShoppingCart className="size-4" />
            {cartBadge}
          </Button>
          <Button variant="ghost" size="icon" render={<Link href="/account" />}>
            <User className="size-4" />
          </Button>
        </div>

        <div className="ml-auto md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon">
                  <Menu className="size-5" />
                </Button>
              }
            />
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>BuyGadgets</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-4">
                {[
                  ...navItems,
                  { label: "Cart", href: "/cart" },
                  { label: "Compare", href: "/compare" },
                  { label: "Wishlist", href: "/account/wishlist" },
                  { label: "Account", href: "/account" },
                ].map((item) =>
                  item.href ? (
                    <Button
                      key={item.label}
                      variant="ghost"
                      className="justify-start"
                      render={<Link href={item.href} onClick={() => setMobileOpen(false)} />}
                    >
                      {item.label}
                    </Button>
                  ) : (
                    <Button key={item.label} variant="ghost" className="justify-start" disabled>
                      {item.label}
                      <Badge variant="outline" className="ml-1.5 text-[10px] uppercase">
                        Soon
                      </Badge>
                    </Button>
                  ),
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
