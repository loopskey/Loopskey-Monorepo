"use client";

import { DashboardSidebarSkeleton } from "@layouts/parts/DashboardSkeleton";
import { getDashboardTabsByRole } from "@/utils/dashboard-nav.config";
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
    <aside className="sticky top-0 hidden h-screen shrink-0 border-r border-glass-border md:block md:w-[84px] xl:w-72">
      <div className="flex h-full flex-col">
        <div className="flex h-20 items-center justify-center px-4 xl:justify-start">
          <Logo />
        </div>
        <nav className="mt-4 flex-1 space-y-2 overflow-y-auto px-3 pb-4">
          {tabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;
            return (
              <Link
                key={item.value}
                href={item.href}
                title={t(item.labelKey)}
                className={cn(
                  "group flex h-14 items-center rounded-2xl px-4 text-sm font-bold transition-all",
                  "text-muted-foreground hover:bg-primary/10 hover:text-primary",
                  isActive &&
                    "bg-primary text-primary-foreground shadow-[0_18px_45px_rgba(59,130,246,0.22)] hover:bg-primary hover:text-primary-foreground",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="ml-3 hidden truncate xl:block">
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-glass-border p-3">
          <Link
            href={getDashboardPath(role)}
            className="flex h-12 items-center justify-center rounded-2xl bg-muted/50 text-xs font-bold text-muted-foreground xl:px-4"
          >
            <span className="hidden xl:block">{role}</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};
