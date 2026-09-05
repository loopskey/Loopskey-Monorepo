"use client";

import { DashboardContentSkeleton } from "@layouts/parts/DashboardSkeleton";
import { AssociationReportPeriod } from "@/lib/graphql/base";
import { TAssociationReportView } from "@/types/association-dashboard.types";
import { ALL_FILTER_VALUE } from "@utils/association-reports";
import { Button } from "@ui/button";

import dynamic from "next/dynamic";

import * as REPORTS from "@utils/association-reports";
import * as L from "lucide-react";

const loading = () => <DashboardContentSkeleton />;

const BODIES = {
  "overview-summary": dynamic(
    () =>
      import(
        "@modules/AssociationDashboard/parts/association-overview-summary-report"
      ),
    { loading },
  ),
  "member-progress": dynamic(
    () =>
      import(
        "@modules/AssociationDashboard/parts/association-member-progress-report"
      ),
    { loading },
  ),
  "group-progress": dynamic(
    () =>
      import(
        "@modules/AssociationDashboard/parts/association-group-progress-report"
      ),
    { loading },
  ),
  "category-completion": dynamic(
    () =>
      import(
        "@modules/AssociationDashboard/parts/association-category-completion-report"
      ),
    { loading },
  ),
  "missing-evidence": dynamic(
    () =>
      import(
        "@modules/AssociationDashboard/parts/association-missing-evidence-report"
      ),
    { loading },
  ),
  "renewal-readiness": dynamic(
    () =>
      import(
        "@modules/AssociationDashboard/parts/association-renewal-readiness-report"
      ),
    { loading },
  ),
};

export const AssociationReportDrilldown = ({
  hook,
}: TAssociationReportView) => {
  const {
    t,
    report,
    filter,
    locale,
    closeReport,
    groupOptions,
    requirementOptions,
  } = hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.reports.${key}`, vars);

  if (!report) return null;

  const Body = BODIES[report];

  const periodLabel =
    filter.period === AssociationReportPeriod.Custom
      ? label("customRange", {
          start: REPORTS.formatReportDate(
            filter.startDate,
            locale,
            label("table.none"),
          ),
          end: REPORTS.formatReportDate(
            filter.endDate,
            locale,
            label("table.none"),
          ),
        })
      : label(`periods.${filter.period}`);

  const named = (
    value: string,
    options: { value: string; label: string }[],
    fallback: string,
  ) =>
    value === ALL_FILTER_VALUE
      ? fallback
      : (options.find((option) => option.value === value)?.label ?? value);

  const chips = [
    periodLabel,
    named(filter.groupId, groupOptions, label("filters.allGroups")),
    named(
      filter.requirementId,
      requirementOptions,
      label("filters.allRequirements"),
    ),
  ];

  return (
    <div className="space-y-6">
      <div>
        <Button radius="xl" type="button" variant="glass" onClick={closeReport}>
          <L.ArrowLeft className="h-4 w-4" />
          {label("view.back")}
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-medium">{label(`names.${report}`)}</h2>

        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {label(`answers.${report}`)}
        </p>

        <ul
          aria-label={label("view.filter")}
          className="mt-4 flex flex-wrap gap-2"
        >
          {chips.map((chip) => (
            <li
              key={chip}
              className="rounded-full border border-glass-border bg-background/50 px-3 py-1 text-xs"
            >
              {chip}
            </li>
          ))}
        </ul>
      </div>

      <Body hook={hook} />

      <p className="text-xs text-muted-foreground">{label("view.sortNote")}</p>
    </div>
  );
};
