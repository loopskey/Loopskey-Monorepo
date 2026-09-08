"use client";

import { TAnimatedTabsProps } from "@/types/element.types";
import { cn } from "@/lib/utils";

export const AnimatedTabs = <T extends string>({
  tabs,
  activeTab,
  onChange,
  className,
  showDescription = false,
}: TAnimatedTabsProps<T>) => {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <div className="inline-flex min-w-max gap-1 rounded-md border bg-card p-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              type="button"
              key={tab.value}
              onClick={() => onChange(tab.value)}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold outline-none transition-colors sm:px-5",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                showDescription &&
                  "min-w-[132px] flex-col px-4 py-2 sm:min-w-[150px]",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span>{tab.label}</span>

              {showDescription && tab.description ? (
                <span
                  className={cn(
                    "mt-0.5 line-clamp-1 text-[11px] font-medium",
                    isActive
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground",
                  )}
                >
                  {tab.description}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};
