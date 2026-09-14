"use client";

import { DashboardSidebarSkeleton } from "@layouts/parts/DashboardSkeleton";
import { getDashboardTabsByRole } from "@/utils/dashboard-nav.config";
import { isDashboardTabActive } from "@/utils/dashboard-nav.config";
import { useCurrentUserQuery } from "@/lib/rtk/endpoints/auth.api";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";
import { getDashboardPath } from "@/utils/constant";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/hooks/useI18n";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

import Link from "next/link";

const LONG_PRESS_MS = 500;
const LONG_PRESS_AUTO_DISMISS_MS = 1800;

export const DashboardSidebar = () => {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const { data, isLoading, isFetching } = useCurrentUserQuery();
  const [peekedTab, setPeekedTab] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);

  const role = data?.user?.role;
  const activeTab = searchParams?.get("tab") ?? "overview";
  if (isLoading || isFetching || !role) return <DashboardSidebarSkeleton />;
  const tabs = getDashboardTabsByRole(role);

  const clearTimers = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
    longPressTimer.current = null;
    autoDismissTimer.current = null;
  };

  const handleTouchStart = (value: string) => () => {
    longPressFired.current = false;
    clearTimers();
    setPeekedTab(null);
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      setPeekedTab(value);
      autoDismissTimer.current = setTimeout(
        () => setPeekedTab(null),
        LONG_PRESS_AUTO_DISMISS_MS,
      );
    }, LONG_PRESS_MS);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  };

  const handleClickCapture = (event: React.MouseEvent) => {
    if (!longPressFired.current) return;
    event.preventDefault();
    longPressFired.current = false;
  };

  return (
    <aside className="flex w-[72px] shrink-0 flex-col bg-primary text-primary-foreground lg:w-64">
      <nav
        aria-label={t("dashboardShell.navLabel")}
        className="min-h-0 flex-1 overflow-y-auto py-2 pl-3"
      >
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
                <Tooltip
                  open={peekedTab === item.value}
                  onOpenChange={(open) =>
                    setPeekedTab(open ? item.value : null)
                  }
                >
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      title={label}
                      aria-label={label}
                      aria-current={isActive ? "page" : undefined}
                      onTouchStart={handleTouchStart(item.value)}
                      onTouchEnd={handleTouchEnd}
                      onTouchCancel={handleTouchEnd}
                      onTouchMove={handleTouchEnd}
                      onClickCapture={handleClickCapture}
                      onClick={() => setPeekedTab(null)}
                      className={cn(
                        "relative z-10 flex h-[60px] items-center rounded-l-[30px] outline-none transition-colors duration-200",
                        "text-sm font-semibold text-primary-foreground",
                        "hover:bg-background hover:text-primary",
                        "focus-visible:ring-2 focus-visible:ring-ring-on-primary focus-visible:ring-offset-2 focus-visible:ring-offset-primary",
                        isActive && "bg-background text-primary",
                      )}
                    >
                      <span className="flex w-[60px] shrink-0 items-center justify-center">
                        <Icon className="size-5 shrink-0" aria-hidden />
                      </span>
                      <span className="hidden truncate pr-4 lg:inline">
                        {label}
                      </span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="lg:hidden">
                    {label}
                  </TooltipContent>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="hidden shrink-0 border-t border-primary-foreground/20 p-3 lg:block">
        <Link
          href={getDashboardPath(role)}
          className={cn(
            "flex h-12 items-center justify-start rounded-md px-3 text-xs font-bold uppercase tracking-wide outline-none transition-colors",
            "text-primary-foreground/80 hover:bg-primary-hover hover:text-primary-foreground",
            "focus-visible:ring-2 focus-visible:ring-ring-on-primary focus-visible:ring-offset-2 focus-visible:ring-offset-primary",
          )}
        >
          {role}
        </Link>
      </div>
    </aside>
  );
};
