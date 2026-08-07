"use client";

import { useTransition } from "react";
import { Bell } from "lucide-react";

import { markAllNotificationsRead, markNotificationRead } from "@/actions/notifications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminNotification } from "@/services/notifications";

export function NotificationBell({
  notifications,
  unreadCount,
}: {
  notifications: AdminNotification[];
  unreadCount: number;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-4" />
            {unreadCount > 0 ? (
              <Badge className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full p-0 text-[10px]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            ) : null}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between">
            Notifications
            {unreadCount > 0 ? (
              <button
                type="button"
                disabled={isPending}
                className="text-xs font-normal text-muted-foreground hover:text-foreground hover:underline"
                onClick={() =>
                  startTransition(async () => {
                    await markAllNotificationsRead();
                  })
                }
              >
                Mark all read
              </button>
            ) : null}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">No notifications yet.</p>
        ) : (
          <div className="flex max-h-96 flex-col overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-0.5 whitespace-normal"
                onClick={() => {
                  if (!notification.read) {
                    startTransition(async () => {
                      await markNotificationRead(notification.id);
                    });
                  }
                }}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-sm font-medium">{notification.title}</span>
                  {!notification.read ? <span className="size-1.5 shrink-0 rounded-full bg-primary" /> : null}
                </div>
                <span className="text-xs text-muted-foreground">{notification.message}</span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
