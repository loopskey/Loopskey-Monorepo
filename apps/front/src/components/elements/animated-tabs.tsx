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
      <div className="inline-flex min-w-max gap-2 rounded-full border border-glass-border bg-background/45 p-1.5 shadow-sm backdrop-blur-xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              type="button"
              key={tab.value}
              onClick={() => onChange(tab.value)}
              className={cn(
                "relative overflow-hidden rounded-full p-[2px] transition-all duration-300",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              {isActive && (
                <span className="absolute inset-0 animate-[spin_2.8s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(59,130,246,0.95)_80deg,rgba(20,184,166,0.95)_160deg,rgba(168,85,247,0.95)_240deg,transparent_360deg)]" />
              )}

              <span
                className={cn(
                  "relative z-10 flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-300 sm:px-5",
                  showDescription &&
                    "min-w-[132px] flex-col px-4 py-2 sm:min-w-[150px]",
                  isActive
                    ? "bg-background/95 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] backdrop-blur-xl"
                    : "hover:bg-primary/10",
                )}
              >
                <span>{tab.label}</span>

                {showDescription && tab.description ? (
                  <span className="mt-0.5 line-clamp-1 text-[11px] font-medium text-muted-foreground">
                    {tab.description}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
