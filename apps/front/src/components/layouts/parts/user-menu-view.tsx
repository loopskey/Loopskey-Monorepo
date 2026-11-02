"use client";

import { getDashboardPath, solutionEntries } from "@/utils/site-navigation";
import { ChevronDown, LayoutDashboard } from "lucide-react";
import { getDashboardProfilePath } from "@/utils/site-navigation";
import { LogOut, UserRound } from "lucide-react";
import { UserAvatar } from "@elements/user-avatar";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import Link from "next/link";

import type { TUserMenuViewProps } from "@/types/layouts.types";

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
          variant="ghost"
          aria-label={t("userMenu.open")}
          className="group relative size-11 shrink-0 p-0 hover:bg-transparent focus-visible:ring-offset-2 min-[380px]:size-12"
        >
          <UserAvatar
            email={user.email}
            fullName={user.fullName}
            avatarUrl={user.avatarUrl}
            className="size-9 ring-2 ring-primary/20 transition-shadow duration-200 group-hover:shadow-[0_6px_14px_-6px_oklch(0.3351_0.1745_271.87/0.45)] group-hover:ring-primary/55 group-aria-expanded:ring-primary min-[380px]:size-10"
            fallbackClassName="bg-accent text-sm font-extrabold text-primary"
          />
          <span
            aria-hidden
            className="absolute -bottom-0.5 -right-0.5 grid size-[18px] place-items-center rounded-full border-[1.5px] border-border bg-background text-primary transition-colors duration-200 group-hover:border-background group-hover:bg-primary group-hover:text-primary-foreground group-aria-expanded:border-background group-aria-expanded:bg-primary group-aria-expanded:text-primary-foreground"
          >
            <ChevronDown className="size-2.5 stroke-[3] transition-transform duration-200 group-aria-expanded:rotate-180 motion-reduce:transition-none" />
          </span>
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
