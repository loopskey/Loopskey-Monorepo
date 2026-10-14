"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";
import { DashboardSidebarSkeleton } from "@layouts/parts/DashboardSkeleton";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
import { DashboardNavList } from "@layouts/parts/DashboardNavList";
import { useDashboardNav } from "@/hooks/useDashboardNav";
import { siteLinks } from "@utils/constant";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

import type { ReactElement } from "react";

import Link from "next/link";

import * as L from "lucide-react";

const FOOTER_ITEM_CLASS_NAME =
  "flex h-11 w-full cursor-pointer items-center rounded-lg text-sm font-semibold text-primary-foreground/80 outline-none transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring-on-primary focus-visible:ring-offset-2 focus-visible:ring-offset-primary";

export const DashboardSidebar = () => {
  const { t } = useI18n();
  const { role, tabs, activeTab, isReady } = useDashboardNav();
  const { isCollapsed, toggleCollapsed } = useSidebarCollapsed();

  if (!isReady || !role) return <DashboardSidebarSkeleton />;

  const helpLabel = t("dashboardShell.helpSupport");
  const toggleLabel = t(
    isCollapsed
      ? "dashboardShell.expandSidebar"
      : "dashboardShell.collapseSidebar",
  );

  const withTooltip = (label: string, node: ReactElement) =>
    isCollapsed ? (
      <Tooltip>
        <TooltipTrigger asChild>{node}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    ) : (
      node
    );

  return (
    <aside
      className={cn(
        "sticky top-16 z-30 hidden h-[calc(100dvh-4rem)] shrink-0 flex-col bg-primary text-primary-foreground transition-[width] duration-300 ease-out motion-reduce:transition-none lg:flex",
        isCollapsed ? "w-[76px]" : "w-64",
      )}
    >
      <nav
        aria-label={t("dashboardShell.navLabel")}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-3 pl-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <DashboardNavList
          tabs={tabs}
          activeTab={activeTab}
          isCollapsed={isCollapsed}
        />
      </nav>

      <div className="shrink-0 space-y-1 border-t border-primary-foreground/15 p-3">
        {withTooltip(
          helpLabel,
          <Link
            href={siteLinks.faq}
            className={FOOTER_ITEM_CLASS_NAME}
            aria-label={isCollapsed ? helpLabel : undefined}
          >
            <span className="flex w-[52px] shrink-0 justify-center">
              <L.HelpCircle aria-hidden className="size-[18px]" />
            </span>
            {isCollapsed ? null : <span className="truncate">{helpLabel}</span>}
          </Link>,
        )}

        {withTooltip(
          toggleLabel,
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-pressed={isCollapsed}
            aria-label={isCollapsed ? toggleLabel : undefined}
            className={FOOTER_ITEM_CLASS_NAME}
          >
            <span className="flex w-[52px] shrink-0 justify-center">
              {isCollapsed ? (
                <L.PanelLeftOpen aria-hidden className="size-[18px]" />
              ) : (
                <L.PanelLeftClose aria-hidden className="size-[18px]" />
              )}
            </span>
            {isCollapsed ? null : (
              <span className="truncate">{toggleLabel}</span>
            )}
          </button>,
        )}
      </div>
    </aside>
  );
};
