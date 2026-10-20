"use client";

import { LANDING_SHELF_KIND_DOT_CLASS_NAME } from "@/utils/landing-shelf.constant";
import { TLearningHubTabsProps } from "@/types/landing-module.types";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

const LearningHubTabs = ({
  tabs,
  onChange,
  activeTab,
}: TLearningHubTabsProps) => {
  const { t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t("landing.learningHub.tabsLabel")}
      className="max-w-full overflow-x-auto rounded-xl bg-muted p-1"
    >
      <div className="inline-flex min-w-max gap-1">
        {tabs.map((tab) => {
          const isActive = tab.value === activeTab;

          return (
            <button
              type="button"
              key={tab.value}
              aria-pressed={isActive}
              onClick={() => onChange(tab.value)}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold outline-none",
                "transition-[background-color,color,box-shadow] duration-300",
                "focus-visible:ring-[3px] focus-visible:ring-ring/35",
                isActive
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "size-2 rounded-full",
                  LANDING_SHELF_KIND_DOT_CLASS_NAME[tab.value],
                )}
              />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LearningHubTabs;
