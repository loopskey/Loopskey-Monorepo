"use client";

import { LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { getDashboardPath, siteLinks } from "@/utils/constant";
import { getDashboardProfilePath } from "@/utils/constant";
import { useCurrentUserQuery } from "@/lib/rtk/endpoints/auth.api";
import { useLogoutMutation } from "@/lib/rtk/endpoints/auth.api";
import { UserAvatar } from "@elements/user-avatar";
import { useRouter } from "next/navigation";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import Link from "next/link";

import * as D from "@ui/dropdown-menu";

type TUserMenuProps = {
  variant?: "dropdown" | "inline";
  onNavigate?: () => void;
};

export const UserMenu = ({
  onNavigate,
  variant = "dropdown",
}: TUserMenuProps = {}) => {
  const { t } = useI18n();
  const router = useRouter();
  const { data, isLoading } = useCurrentUserQuery();

  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const user = data?.user;

  if (isLoading || !user) return null;

  const dashboardPath = getDashboardPath(user.role);
  const profilePath = getDashboardProfilePath(user.role);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      notify.success(t("userMenu.logout"));
      onNavigate?.();
      router.replace(siteLinks.home);
      router.refresh();
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

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
            <p className="mt-1 text-xs font-semibold text-primary">
              {user.role}
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
          disabled={isLoggingOut}
          onClick={() => void handleLogout()}
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
          className="h-12 gap-3 px-2 pr-4"
        >
          <UserAvatar
            email={user.email}
            fullName={user.fullName}
            avatarUrl={user.avatarUrl}
            className="h-9 w-9 border border-primary/20"
            fallbackClassName="bg-primary/10 text-sm font-bold text-primary"
          />
          <span className="hidden min-w-0 text-left md:block">
            <span className="block max-w-32 truncate text-sm font-bold">
              {user.fullName ?? user.email}
            </span>
            <span className="block text-xs text-muted-foreground">
              {user.role}
            </span>
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
            <p className="mt-1 text-xs font-semibold text-primary">
              {user.role}
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
          onClick={handleLogout}
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
