"use client";

import { AssociationReportExportMenu } from "@modules/AssociationDashboard/parts/association-report-export-menu";
import { AssociationReportsFilters } from "@modules/AssociationDashboard/parts/association-reports-filters";
import { AssociationReportExports } from "@modules/AssociationDashboard/parts/association-report-exports";
import { AssociationReportDrilldown } from "@modules/AssociationDashboard/parts/association-report-view";
import { AssociationReportLibrary } from "@modules/AssociationDashboard/parts/association-report-library";
import { AssociationReportsCharts } from "@modules/AssociationDashboard/parts/association-reports-charts";
import { AssociationReportsCards } from "@modules/AssociationDashboard/parts/association-reports-cards";
import { useAssociationReportsTab } from "@hooks/useAssociationReportsTab";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import Link from "next/link";

import * as REPORTS from "@utils/association-reports";
import * as L from "lucide-react";

const AssociationReportsTab = () => {
  const hook = useAssociationReportsTab();

  const {
    t,
    retry,
    report,
    locale,
    summary,
    isError,
    hasNoRequirements,
    isStaleComputedAt,
    isRangeIncomplete,
  } = hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.reports.${key}`, vars);

  const header = (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-primary">
          {t("associationDashboard.eyebrow")}
        </p>

        <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
          {label("title")}
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {label("description")}
        </p>
      </div>

      {!hasNoRequirements && !report && (
        <AssociationReportExportMenu hook={hook} />
      )}
    </section>
  );

  if (hasNoRequirements)
    return (
      <div className="space-y-6">
        {header}

        <GlassCard glow={false}>
          <div className="relative z-10 py-10 text-center">
            <L.ClipboardList className="mx-auto h-8 w-8 text-muted-foreground" />

            <p className="mt-4 font-medium">{label("empty.title")}</p>

            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              {label("empty.body")}
            </p>

            <Button radius="xl" variant="brand" className="mt-5" asChild>
              <Link href="/dashboard/association?tab=requirements">
                <L.ArrowUpRight className="h-4 w-4" />
                {label("empty.action")}
              </Link>
            </Button>
          </div>
        </GlassCard>
      </div>
    );

  return (
    <div className="space-y-6">
      {header}

      <GlassCard glow={false}>
        <div className="relative z-10">
          <AssociationReportsFilters hook={hook} />
        </div>
      </GlassCard>

      {isRangeIncomplete && (
        <p className="rounded-2xl border border-glass-border bg-background/50 p-4 text-sm text-muted-foreground">
          {label("rangeIncomplete")}
        </p>
      )}

      {!isRangeIncomplete && isStaleComputedAt && (
        <p className="text-xs text-muted-foreground">
          {label("computedAt", {
            when: REPORTS.formatReportDate(
              summary?.computedAt,
              locale,
              label("table.none"),
            ),
          })}
        </p>
      )}

      {isError ? (
        <GlassCard glow={false}>
          <div className="relative z-10 py-8 text-center">
            <L.TriangleAlert className="mx-auto h-8 w-8 text-destructive" />

            <p className="mt-4 font-medium">{label("error.title")}</p>

            <p className="mt-1 text-sm text-muted-foreground">
              {label("error.body")}
            </p>

            <Button
              radius="xl"
              type="button"
              variant="glass"
              className="mt-5"
              onClick={retry}
            >
              <L.RotateCcw className="h-4 w-4" />
              {label("error.retry")}
            </Button>
          </div>
        </GlassCard>
      ) : report ? (
        <AssociationReportDrilldown hook={hook} />
      ) : (
        <>
          <AssociationReportsCards hook={hook} />
          <AssociationReportsCharts hook={hook} />
          <AssociationReportLibrary hook={hook} />
          <AssociationReportExports hook={hook} />
        </>
      )}
    </div>
  );
};

export default AssociationReportsTab;
