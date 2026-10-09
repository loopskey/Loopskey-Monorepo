"use client";

import { TContentTabsProps } from "@/types/content-module.types";
import { LinkPending } from "@elements/link-pending";
import { TContentTab } from "@/types/content-module.types";
import { useI18n } from "@/hooks/useI18n";
import { tabHref } from "@/lib/content-catalog/catalog-href";
import { cn } from "@/lib/utils";

import Link from "next/link";

import * as L from "lucide-react";

const TAB_ORDER: TContentTab[] = ["courses", "events", "podcasts", "youtube"];

const TAB_ICON: Record<TContentTab, L.LucideIcon> = {
  courses: L.BookOpen,
  events: L.CalendarDays,
  podcasts: L.Podcast,
  youtube: L.Youtube,
};

const TAB_ACTIVE_CLASS_NAME: Record<TContentTab, string> = {
  courses: "bg-ct-course text-ct-course-foreground",
  events: "bg-ct-event text-ct-event-foreground",
  podcasts: "bg-ct-podcast text-ct-podcast-foreground",
  youtube: "bg-ct-youtube text-ct-youtube-foreground",
};

const CONTENT_TABS = TAB_ORDER.map((value) => ({
  value,
  href: tabHref(value),
}));

const ContentTabs = ({ activeTab }: TContentTabsProps) => {
  const { t } = useI18n();

  return (
    <nav
      aria-label={t("content.tabs.label")}
      className="grid h-11 w-full grid-cols-4 gap-1 rounded-xl bg-muted p-1 sm:inline-flex sm:h-11 sm:w-auto"
    >
      {CONTENT_TABS.map((tab) => {
        const Icon = TAB_ICON[tab.value];
        const isActive = tab.value === activeTab;
        return (
          <Link
            key={tab.value}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring sm:px-4 sm:text-sm",
              isActive &&
                cn(
                  "shadow-sm hover:text-inherit",
                  TAB_ACTIVE_CLASS_NAME[tab.value],
                ),
            )}
          >
            <Icon className="hidden size-4 shrink-0 sm:block" aria-hidden />
            <span className="truncate">{t(`content.tabs.${tab.value}`)}</span>
            <LinkPending />
          </Link>
        );
      })}
    </nav>
  );
};

export default ContentTabs;
