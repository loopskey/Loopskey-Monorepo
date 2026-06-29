"use client";

import { DashboardBottomNavSkeleton } from "@layouts/parts/DashboardSkeleton";
import { getDashboardTabsByRole } from "@/utils/dashboard-nav.config";
import { useCurrentUserQuery } from "@/lib/rtk/endpoints/auth.api";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

import Link from "next/link";

export const DashboardBottomNav = () => {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const { data, isLoading, isFetching } = useCurrentUserQuery();
  const role = data?.user?.role;
  const activeTab = searchParams?.get("tab") ?? "overview";
  if (isLoading || isFetching || !role) return <DashboardBottomNavSkeleton />;
  const tabs = getDashboardTabsByRole(role);

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50 rounded-[2rem] border border-glass-border bg-background/85 p-2 shadow-2xl backdrop-blur-2xl md:hidden">
      <div className="grid grid-cols-4 gap-1">
        {tabs.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.value;
          return (
            <Link
              key={item.value}
              href={item.href}
              aria-label={t(item.labelKey)}
              className={cn(
                "flex h-14 items-center justify-center rounded-2xl text-muted-foreground transition-all",
                isActive && "bg-primary text-primary-foreground shadow-lg",
              )}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
