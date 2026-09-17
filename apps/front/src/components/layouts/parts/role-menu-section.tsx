"use client";

import { solutionEntries } from "@utils/constant";
import { useActiveRole } from "@/providers/active-role-provider";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

import Link from "next/link";

export const RoleMenuSection = () => {
  const { t } = useI18n();
  const { activeRoleHref } = useActiveRole();

  return (
    <div className="border-t border-border/70 pt-4">
      <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("common.continueAs")}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {solutionEntries.map((entry) => {
          const isActive = entry.href === activeRoleHref;
          const Icon = entry.icon;

          return (
            <Link
              key={entry.href}
              href={entry.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-md border px-3 py-2.5 text-left text-sm font-semibold transition-colors duration-200",
                isActive
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/70 text-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{t(entry.roleLabelKey)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
