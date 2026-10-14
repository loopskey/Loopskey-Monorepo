"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";
import { isDashboardTabActive } from "@/utils/dashboard-nav.config";
import { groupDashboardTabs } from "@/utils/dashboard-nav.config";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

import type { DashboardNavListProps } from "@/types/element.types";

import Link from "next/link";

export const DashboardNavList = ({
  tabs,
  activeTab,
  onNavigate,
  isCollapsed = false,
}: DashboardNavListProps) => {
  const { t } = useI18n();
  const groups = groupDashboardTabs(tabs);

  return (
    <div className="space-y-2.5">
      {groups.map((group, index) => (
        <div key={group.key ?? "main"}>
          {group.key ? (
            isCollapsed ? (
              <hr
                aria-hidden
                className="mx-3 my-2 border-primary-foreground/15"
              />
            ) : (
              <p className="truncate px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground/65">
                {t(group.key)}
              </p>
            )
          ) : index > 0 ? (
            <hr
              aria-hidden
              className="mx-3 my-2 border-primary-foreground/15"
            />
          ) : null}

          <ul>
            {group.tabs.map((item) => {
              const Icon = item.icon;
              const isActive = isDashboardTabActive(item.value, activeTab);
              const label = t(item.labelKey);

              const link = (
                <Link
                  href={item.href}
                  onClick={(event) => {
                    if (isActive) event.preventDefault();
                    onNavigate?.();
                  }}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={isCollapsed ? label : undefined}
                  className={cn(
                    "relative z-10 flex h-[52px] items-center rounded-l-[26px] text-sm font-semibold outline-none transition-colors duration-200",
                    "focus-visible:ring-2 focus-visible:ring-ring-on-primary focus-visible:ring-offset-2 focus-visible:ring-offset-primary",
                    isActive
                      ? "bg-background text-primary"
                      : "text-primary-foreground hover:bg-primary-foreground/10",
                  )}
                >
                  <span className="flex w-[52px] shrink-0 items-center justify-center">
                    <Icon className="size-5 shrink-0" aria-hidden />
                  </span>
                  {isCollapsed ? null : (
                    <span className="truncate pr-4">{label}</span>
                  )}
                </Link>
              );

              return (
                <li
                  key={item.value}
                  className="sidebar-item"
                  data-active={isActive}
                >
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right">{label}</TooltipContent>
                    </Tooltip>
                  ) : (
                    link
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
};
