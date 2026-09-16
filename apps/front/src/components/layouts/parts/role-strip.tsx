"use client";

import { solutionEntries } from "@utils/constant";
import { useActiveRole } from "@/providers/active-role-provider";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

type TRoleStripProps = {
  lockedHref?: string;
};

export const RoleStrip = ({ lockedHref }: TRoleStripProps) => {
  const { t } = useI18n();
  const { activeRoleHref, setActiveRoleHref } = useActiveRole();
  const isLocked = Boolean(lockedHref);
  const currentActiveHref = lockedHref ?? activeRoleHref;

  return (
    <div className="hidden h-10 w-full border-b border-border/70 bg-primary/5 lg:block">
      <div className="mx-auto flex h-10 max-w-7xl items-center gap-1 px-4 sm:px-6 lg:px-8">
        {solutionEntries.map((entry) => {
          const isActive = entry.href === currentActiveHref;
          const isDisabled = isLocked && !isActive;

          return (
            <button
              key={entry.href}
              type="button"
              aria-pressed={isActive}
              disabled={isDisabled}
              onClick={() => !isLocked && setActiveRoleHref(entry.href)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
                isDisabled &&
                  "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-muted-foreground",
              )}
            >
              {t(entry.roleLabelKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
};
