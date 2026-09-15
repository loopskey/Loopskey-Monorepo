"use client";

import { solutionEntries } from "@utils/constant";
import { useActiveRole } from "@/providers/active-role-provider";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

export const RoleStrip = () => {
  const { t } = useI18n();
  const { activeRoleHref, setActiveRoleHref } = useActiveRole();

  return (
    <div className="h-10 w-full border-b border-border/70 bg-primary/5">
      <div className="mx-auto flex h-10 max-w-7xl items-center gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
        {solutionEntries.map((entry) => {
          const isActive = entry.href === activeRoleHref;

          return (
            <button
              key={entry.href}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveRoleHref(entry.href)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
              )}
            >
              {t(entry.labelKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
};
