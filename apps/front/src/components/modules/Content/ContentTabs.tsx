"use client";

import { TContentTabsProps } from "@/types/content-module.types";
import { TContentTab } from "@/types/content-module.types";
import { cn } from "@/lib/utils";

import * as Tb from "@ui/tabs";
import * as L from "lucide-react";

const TAB_ICON: Record<TContentTab, L.LucideIcon> = {
  courses: L.BookOpen,
  events: L.CalendarDays,
  podcasts: L.Podcast,
  youtube: L.Youtube,
};

const TAB_ACTIVE_CLASS_NAME: Record<TContentTab, string> = {
  courses:
    "data-[state=active]:bg-ct-course data-[state=active]:text-ct-course-foreground",
  events:
    "data-[state=active]:bg-ct-event data-[state=active]:text-ct-event-foreground",
  podcasts:
    "data-[state=active]:bg-ct-podcast data-[state=active]:text-ct-podcast-foreground",
  youtube:
    "data-[state=active]:bg-ct-youtube data-[state=active]:text-ct-youtube-foreground",
};

const ContentTabs = ({
  label,
  tabs,
  onChange,
  activeTab,
}: TContentTabsProps) => {
  return (
    <Tb.Tabs
      value={activeTab}
      className="w-full sm:w-auto"
      onValueChange={(value) => onChange(value as TContentTab)}
    >
      <Tb.TabsList
        aria-label={label}
        className="grid h-11 w-full grid-cols-4 gap-1 rounded-xl bg-muted/70 p-1 sm:inline-flex sm:h-11 sm:w-auto"
      >
        {tabs.map((tab) => {
          const Icon = TAB_ICON[tab.value];
          return (
            <Tb.TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                "gap-1.5 rounded-lg px-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground data-[state=active]:shadow-sm sm:px-4 sm:text-sm",
                TAB_ACTIVE_CLASS_NAME[tab.value],
              )}
            >
              <Icon className="hidden size-4 shrink-0 sm:block" aria-hidden />
              <span className="truncate">{tab.label}</span>
            </Tb.TabsTrigger>
          );
        })}
      </Tb.TabsList>
    </Tb.Tabs>
  );
};

export default ContentTabs;
