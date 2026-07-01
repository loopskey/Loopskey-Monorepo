"use client";

import { LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { getDashboardPath, siteLinks } from "@/utils/constant";
import { getDashboardProfilePath } from "@/utils/constant";
import { useCurrentUserQuery } from "@/lib/rtk/endpoints/auth.api";
import { useLogoutMutation } from "@/lib/rtk/endpoints/auth.api";
import { getInitials } from "@/utils/function-helper";
import { useRouter } from "next/navigation";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import Link from "next/link";

import * as D from "@ui/dropdown-menu";
import * as A from "@ui/avatar";

export const UserMenu = () => {
  const { t } = useI18n();
  const router = useRouter();

  const { data, isLoading } = useCurrentUserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const user = data?.user;

  if (isLoading || !user) return null;

  const dashboardPath = getDashboardPath(user.role);
  const profilePath = getDashboardProfilePath(user.role);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      notify.success(t("userMenu.logout"));
      router.replace(siteLinks.home);
      router.refresh();
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  return (
    <D.DropdownMenu>
      <D.DropdownMenuTrigger asChild>
        <Button
          type="button"
          radius="full"
          variant="glass"
          className="h-12 gap-3 px-2 pr-4"
        >
          <A.Avatar className="h-9 w-9 border border-primary/20">
            {user.avatarUrl ? <A.AvatarImage src={user.avatarUrl} /> : null}
            <A.AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
              {getInitials(user.fullName, user.email)}
            </A.AvatarFallback>
          </A.Avatar>
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
        className={cn(
          "w-72 rounded-3xl border-glass-border bg-background/85 p-2 shadow-2xl backdrop-blur-2xl",
        )}
      >
        <div className="flex items-center gap-3 rounded-2xl bg-primary/5 p-3">
          <A.Avatar className="h-11 w-11 border border-primary/20">
            {user.avatarUrl ? <A.AvatarImage src={user.avatarUrl} /> : null}
            <A.AvatarFallback className="bg-primary/10 font-bold text-primary">
              {getInitials(user.fullName, user.email)}
            </A.AvatarFallback>
          </A.Avatar>

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
        <D.DropdownMenuItem asChild className="rounded-2xl p-3">
          <Link href={dashboardPath}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            {t("userMenu.dashboard")}
          </Link>
        </D.DropdownMenuItem>
        <D.DropdownMenuItem asChild className="rounded-2xl p-3">
          <Link href={profilePath}>
            <UserRound className="mr-2 h-4 w-4" />
            {t("userMenu.profile")}
          </Link>
        </D.DropdownMenuItem>
        <D.DropdownMenuSeparator className="my-2" />
        <D.DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="rounded-2xl p-3 text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? t("userMenu.loggingOut") : t("userMenu.logout")}
        </D.DropdownMenuItem>
      </D.DropdownMenuContent>
    </D.DropdownMenu>
  );
};
