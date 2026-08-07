"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";

import { logoutAdmin } from "@/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function NavUser({
  name,
  email,
  role,
}: {
  name: string;
  email: string | null | undefined;
  role: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm outline-none hover:bg-sidebar-accent">
        <Avatar size="sm">
          <AvatarFallback>{initials(name) || "A"}</AvatarFallback>
        </Avatar>
        <span className="flex min-w-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
          <span className="truncate font-medium">{name}</span>
          <span className="truncate text-xs text-muted-foreground">
            {email}
          </span>
        </span>
        <Badge
          variant="secondary"
          className="text-[10px] uppercase group-data-[collapsible=icon]:hidden"
        >
          {role}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">{name}</span>
              <span className="text-xs text-muted-foreground">{email}</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isPending}
          onClick={() => startTransition(() => logoutAdmin())}
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
