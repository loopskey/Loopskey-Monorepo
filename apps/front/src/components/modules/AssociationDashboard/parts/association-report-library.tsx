"use client";

import { TAssociationReportLibrary } from "@/types/association-dashboard.types";
import { ASSOCIATION_REPORT_KEYS } from "@utils/association-reports";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import * as L from "lucide-react";

const REPORT_ICONS = {
  "overview-summary": L.LayoutDashboard,
  "member-progress": L.Users,
  "group-progress": L.Boxes,
  "category-completion": L.ChartColumn,
  "missing-evidence": L.FileWarning,
  "renewal-readiness": L.BadgeCheck,
} as const;

export const AssociationReportLibrary = ({
  hook,
}: TAssociationReportLibrary) => {
  const { t, openReport } = hook;

  const label = (key: string) => t(`associationDashboard.reports.${key}`);

  return (
    <GlassCard>
      <div className="relative z-10">
        <h2 className="text-xl font-medium">{label("library.title")}</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {label("library.description")}
        </p>

        <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ASSOCIATION_REPORT_KEYS.map((key) => {
            const Icon = REPORT_ICONS[key];

            return (
              <li
                key={key}
                className="flex flex-col rounded-3xl border border-glass-border bg-background/50 p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-2xl bg-primary/10 p-2.5 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>

                  <h3 className="font-medium">{label(`names.${key}`)}</h3>
                </div>

                <p className="mt-3 flex-1 text-sm text-muted-foreground">
                  {label(`answers.${key}`)}
                </p>

                <div className="mt-4">
                  <Button
                    size="sm"
                    radius="xl"
                    type="button"
                    variant="glass"
                    onClick={() => openReport(key)}
                  >
                    <L.ArrowUpRight className="h-4 w-4" />
                    {label("library.open")}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </GlassCard>
  );
};
