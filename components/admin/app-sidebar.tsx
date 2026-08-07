"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  CreditCard,
  FolderTree,
  LayoutDashboard,
  LayoutTemplate,
  Package,
  ShoppingCart,
  Star,
  Tag,
  Ticket,
  Truck,
  UserCog,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems: {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Product Management", href: "/admin/products", icon: Package },
  { title: "Categories", href: "/admin/categories", icon: FolderTree },
  { title: "Brands", href: "/admin/brands", icon: Tag },
  { title: "Inventory", href: "/admin/inventory", icon: Boxes },
  { title: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { title: "Customers", href: "/admin/customers", icon: Users },
  { title: "Reviews", href: "/admin/reviews", icon: Star },
  { title: "Coupons", href: "/admin/coupons", icon: Ticket },
  { title: "Homepage Manager", href: "/admin/homepage", icon: LayoutTemplate },
  { title: "Delivery Settings", href: "/admin/delivery-settings", icon: Truck },
  { title: "Payment Settings", href: "/admin/payment-settings", icon: CreditCard },
  { title: "Reports", href: "/admin/reports", icon: BarChart3 },
  { title: "Users", href: "/admin/users", icon: UserCog },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-3">
        <span className="text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
          BuyGadgets Admin
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Store</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.href ? (
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={
                        item.href === "/admin"
                          ? pathname === "/admin"
                          : pathname.startsWith(item.href)
                      }
                      tooltip={item.title}
                    >
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton
                      disabled
                      tooltip={`${item.title} (coming soon)`}
                    >
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  )}
                  {!item.href ? (
                    <SidebarMenuBadge className="text-[10px] uppercase text-muted-foreground">
                      Soon
                    </SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
