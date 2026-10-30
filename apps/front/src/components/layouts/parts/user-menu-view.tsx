"use client";

import { EllipsisVertical, LayoutDashboard } from "lucide-react";
import { getDashboardPath, solutionEntries } from "@/utils/site-navigation";
import { getDashboardProfilePath } from "@/utils/site-navigation";
import type { TUserMenuViewProps } from "@/types/layouts.types";
import { LogOut, UserRound } from "lucide-react";
import { UserAvatar } from "@elements/user-avatar";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import Link from "next/link";

import * as D from "@ui/dropdown-menu";

export const UserMenuView = ({
  user,
  onLogout,
  onNavigate,
  isLoggingOut,
  variant = "dropdown",
}: TUserMenuViewProps) => {
  const { t } = useI18n();
  const dashboardPath = getDashboardPath(user.role);
  const profilePath = getDashboardProfilePath(user.role);
  const roleEntry = solutionEntries.find((entry) => entry.role === user.role);
  const roleLabel = roleEntry ? t(roleEntry.roleLabelKey) : user.role;

  if (variant === "inline") {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 rounded-md bg-primary/5 p-3">
          <UserAvatar
            email={user.email}
            fullName={user.fullName}
            avatarUrl={user.avatarUrl}
            className="h-11 w-11 border border-primary/20"
            fallbackClassName="bg-primary/10 font-bold text-primary"
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-bold">
              {user.fullName ?? "User"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
            <p className="mt-1.5 w-fit rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
              {roleLabel}
            </p>
          </div>
        </div>

        <Link
          href={dashboardPath}
          onClick={onNavigate}
          className="flex items-center rounded-md px-4 py-3 text-sm font-semibold text-foreground transition-colors duration-300 hover:bg-primary/10 hover:text-primary"
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          {t("userMenu.dashboard")}
        </Link>

        <Link
          href={profilePath}
          onClick={onNavigate}
          className="flex items-center rounded-md px-4 py-3 text-sm font-semibold text-foreground transition-colors duration-300 hover:bg-primary/10 hover:text-primary"
        >
          <UserRound className="mr-2 h-4 w-4" />
          {t("userMenu.profile")}
        </Link>

        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="flex items-center rounded-md px-4 py-3 text-start text-sm font-semibold text-destructive transition-colors duration-300 hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? t("userMenu.loggingOut") : t("userMenu.logout")}
        </button>
      </div>
    );
  }

  return (
    <D.DropdownMenu>
      <D.DropdownMenuTrigger asChild>
        <Button
          type="button"
          radius="full"
          variant="outline"
          aria-label={t("userMenu.open")}
          className="h-10 gap-0.5 p-1 pr-1 hover:border-primary/30 aria-expanded:border-primary/30 aria-expanded:bg-accent/60 min-[380px]:h-11 min-[380px]:pr-1.5"
        >
          <UserAvatar
            email={user.email}
            fullName={user.fullName}
            avatarUrl={user.avatarUrl}
            className="size-8 border border-primary/20 min-[380px]:size-9"
            fallbackClassName="bg-primary/10 text-sm font-bold text-primary"
          />
          <EllipsisVertical
            aria-hidden
            className="size-[18px] shrink-0 text-muted-foreground"
          />
        </Button>
      </D.DropdownMenuTrigger>
      <D.DropdownMenuContent
        align="end"
        className={cn("w-56 rounded-lg border-border p-2 shadow-md sm:w-72")}
      >
        <div
          style={{ animationDelay: "0ms" }}
          className="animate-in fade-in-0 slide-in-from-top-1 flex items-center gap-3 rounded-md bg-primary/5 p-3 duration-200 motion-reduce:animate-none"
        >
          <UserAvatar
            email={user.email}
            fullName={user.fullName}
            avatarUrl={user.avatarUrl}
            className="h-11 w-11 border border-primary/20"
            fallbackClassName="bg-primary/10 font-bold text-primary"
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-bold">
              {user.fullName ?? "User"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
            <p className="mt-1.5 w-fit rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
              {roleLabel}
            </p>
          </div>
        </div>
        <D.DropdownMenuSeparator className="my-2" />
        <D.DropdownMenuItem
          asChild
          style={{ animationDelay: "50ms" }}
          className="animate-in fade-in-0 slide-in-from-top-1 rounded-md p-3 duration-200 motion-reduce:animate-none"
        >
          <Link href={dashboardPath}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            {t("userMenu.dashboard")}
          </Link>
        </D.DropdownMenuItem>
        <D.DropdownMenuItem
          asChild
          style={{ animationDelay: "100ms" }}
          className="animate-in fade-in-0 slide-in-from-top-1 rounded-md p-3 duration-200 motion-reduce:animate-none"
        >
          <Link href={profilePath}>
            <UserRound className="mr-2 h-4 w-4" />
            {t("userMenu.profile")}
          </Link>
        </D.DropdownMenuItem>
        <D.DropdownMenuSeparator className="my-2" />
        <D.DropdownMenuItem
          onClick={onLogout}
          disabled={isLoggingOut}
          style={{ animationDelay: "150ms" }}
          className="animate-in fade-in-0 slide-in-from-top-1 rounded-md p-3 text-destructive duration-200 motion-reduce:animate-none focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? t("userMenu.loggingOut") : t("userMenu.logout")}
        </D.DropdownMenuItem>
      </D.DropdownMenuContent>
    </D.DropdownMenu>
  );
};
