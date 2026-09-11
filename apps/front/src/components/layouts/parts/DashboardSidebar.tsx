"use client";

import { DashboardSidebarSkeleton } from "@layouts/parts/DashboardSkeleton";
import { getDashboardTabsByRole } from "@/utils/dashboard-nav.config";
import { isDashboardTabActive } from "@/utils/dashboard-nav.config";
import { useCurrentUserQuery } from "@/lib/rtk/endpoints/auth.api";
import { getDashboardPath } from "@/utils/constant";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/hooks/useI18n";
import { Logo } from "@layouts/parts/logo";
import { cn } from "@/lib/utils";

import Link from "next/link";

export const DashboardSidebar = () => {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const { data, isLoading, isFetching } = useCurrentUserQuery();
  const role = data?.user?.role;
  const activeTab = searchParams?.get("tab") ?? "overview";
  if (isLoading || isFetching || !role) return <DashboardSidebarSkeleton />;
  const tabs = getDashboardTabsByRole(role);

  return (
    <aside className="flex w-[72px] shrink-0 flex-col bg-primary text-primary-foreground md:w-64">
      <div className="flex h-16 shrink-0 items-center justify-center px-2 md:justify-start md:px-4">
        <Logo variant="onPrimary" />
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto py-2 pl-2 md:pl-3">
        <ul>
          {tabs.map((item) => {
            const Icon = item.icon;
            const isActive = isDashboardTabActive(item.value, activeTab);
            const label = t(item.labelKey);

            return (
              <li
                key={item.value}
                className="sidebar-item"
                data-active={isActive}
              >
                <Link
                  href={item.href}
                  title={label}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative z-10 flex h-14 items-center rounded-l-[24px] outline-none transition-colors duration-200 md:h-[60px] md:rounded-l-[30px]",
                    "text-sm font-semibold text-primary-foreground",
                    "hover:bg-background hover:text-primary",
                    "focus-visible:ring-2 focus-visible:ring-ring-on-primary focus-visible:ring-offset-2 focus-visible:ring-offset-primary",
                    isActive && "bg-background text-primary",
                  )}
                >
                  <span className="flex w-14 shrink-0 items-center justify-center md:w-[60px]">
                    <Icon className="size-5 shrink-0" aria-hidden />
                  </span>
                  <span className="sr-only md:not-sr-only md:truncate md:pr-4">
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-primary-foreground/20 p-2 md:p-3">
        <Link
          href={getDashboardPath(role)}
          className={cn(
            "flex h-12 items-center justify-center rounded-md text-xs font-bold uppercase tracking-wide outline-none transition-colors",
            "text-primary-foreground/80 hover:bg-primary-hover hover:text-primary-foreground",
            "focus-visible:ring-2 focus-visible:ring-ring-on-primary focus-visible:ring-offset-2 focus-visible:ring-offset-primary",
            "md:justify-start md:px-3",
          )}
        >
          <span className="sr-only md:not-sr-only">{role}</span>
          <span className="md:hidden" aria-hidden>
            {role.charAt(0)}
          </span>
        </Link>
      </div>
    </aside>
  );
};
