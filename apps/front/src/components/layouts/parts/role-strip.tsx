"use client";

import { solutionEntries } from "@/utils/site-navigation";
import type { TRoleStripProps } from "@/types/layouts.types";
import { useActiveRole } from "@/providers/active-role-provider";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

import Link from "@elements/localized-link";

const BAR_CLASS_NAME =
  "hidden h-10 w-full border-b border-border/70 bg-muted/60 lg:block";

const INNER_CLASS_NAME =
  "mx-auto flex h-full max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-8";

export const RoleStrip = ({ workspace }: TRoleStripProps) => {
  const { t } = useI18n();
  const { activeRoleHref, selectRole } = useActiveRole();
  const activeEntry =
    solutionEntries.find((entry) => entry.href === activeRoleHref) ??
    solutionEntries[0];

  if (workspace)
    return (
      <div className={BAR_CLASS_NAME}>
        <div className={INNER_CLASS_NAME}>
          <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-primary/10 px-2.5 text-xs font-semibold text-primary">
            <span aria-hidden className="size-1.5 rounded-full bg-ct-event" />
            {t("navigation.roleBar.workspace", {
              role: t(workspace.roleLabelKey),
            })}
          </span>

          <Link
            href={workspace.dashboardHref}
            className="group ml-auto inline-flex items-center gap-1.5 rounded-md text-xs font-semibold text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t("navigation.roleBar.dashboard")}
            <ArrowRight
              aria-hidden
              className="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </Link>
        </div>
      </div>
    );

  return (
    <div className={BAR_CLASS_NAME}>
      <div className={INNER_CLASS_NAME}>
        <span className="text-xs font-medium text-muted-foreground">
          {t("navigation.roleBar.for")}
        </span>

        <nav
          aria-label={t("navigation.roleBar.label")}
          className="flex h-full items-stretch"
        >
          {solutionEntries.map((entry) => {
            const isActive = entry.href === activeEntry.href;
            return (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={() => selectRole(entry.href)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex shrink-0 items-center whitespace-nowrap px-3 text-xs font-semibold outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  isActive
                    ? "text-primary after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-t-full after:bg-primary"
                    : "text-muted-foreground hover:text-primary",
                )}
              >
                {t(entry.roleLabelKey)}
              </Link>
            );
          })}
        </nav>

        <p className="ml-auto hidden min-w-0 truncate text-xs text-muted-foreground xl:block">
          {t(`navigation.roleBar.taglines.${activeEntry.role.toLowerCase()}`)}
        </p>
      </div>
    </div>
  );
};
