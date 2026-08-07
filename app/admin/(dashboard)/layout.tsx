import { getAdminSession } from "@/lib/auth";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { NavUser } from "@/components/admin/nav-user";
import { NotificationBell } from "@/components/admin/notification-bell";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getAdminNotifications, getUnreadAdminNotificationCount } from "@/services/notifications";

// The whole admin dashboard is private, per-session content (auth-gated via
// getAdminSession()/cookies()) — there's no static shell to prerender here,
// unlike public storefront routes. Opt this subtree out of Cache Components'
// static-shell validation instead of contorting it into Suspense boundaries.
export const instant = false;

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  const name = session.adminUser.profile.fullName ?? "Admin";
  const [notifications, unreadCount] = await Promise.all([
    getAdminNotifications(),
    getUnreadAdminNotificationCount(),
  ]);

  return (
    <SidebarProvider>
      <div className="contents print:hidden">
        <AppSidebar
          name={name}
          email={session.email}
          role={session.adminUser.role}
          notifications={notifications}
          unreadCount={unreadCount}
        />
      </div>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 print:hidden">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell notifications={notifications} unreadCount={unreadCount} />
            <div className="w-56">
              <NavUser
                name={name}
                email={session.email}
                role={session.adminUser.role}
              />
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 print:p-0">{children}</main>
      </SidebarInset>
      <Toaster position="top-right" />
    </SidebarProvider>
  );
}
