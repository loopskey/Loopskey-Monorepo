"use client";

import { TAssociationOverviewRequirements } from "@/types/association-dashboard.types";
import { AssociationOverviewPanel } from "@modules/AssociationDashboard/parts/association-overview-panel";
import { Progress } from "@ui/progress";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import Link from "next/link";

import * as REPORTS from "@utils/association-reports";
import * as O from "@utils/association-overview";
import * as L from "lucide-react";

export const AssociationOverviewRequirements = ({
  hook,
}: TAssociationOverviewRequirements) => {
  const { t, locale, requirements, requirementsPanel } = hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.overview.${key}`, vars);

  const none = t("associationDashboard.reports.table.none");

  const shown = requirements.slice(0, O.OVERVIEW_REQUIREMENT_LIMIT);

  const deadlineOf = (row: (typeof shown)[number]) => {
    if (row.daysRemaining === null || row.daysRemaining === undefined)
      return label("requirements.noDeadline");

    if (row.daysRemaining < 0)
      return label("requirements.overdue", {
        days: Math.abs(row.daysRemaining).toLocaleString(locale),
      });

    return label("requirements.daysLeft", {
      days: row.daysRemaining.toLocaleString(locale),
    });
  };

  return (
    <AssociationOverviewPanel
      isError={requirementsPanel.isError}
      isLoading={requirementsPanel.isLoading}
      retry={requirementsPanel.retry}
      retryLabel={label("retry")}
      errorMessage={label("requirements.error")}
      title={label("requirements.title")}
      description={label("requirements.description")}
      skeleton={
        <ul className="space-y-2">
          {[0, 1, 2].map((row) => (
            <li key={row}>
              <Skeleton className="h-20 w-full rounded-2xl" />
            </li>
          ))}
        </ul>
      }
      action={
        <Button size="sm" radius="xl" variant="glass" asChild>
          <Link href={O.associationTabHref("requirements")}>
            <L.ArrowUpRight className="h-4 w-4" />
            {label("requirements.openTab")}
          </Link>
        </Button>
      }
    >
      {shown.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-glass-border p-5 text-sm text-muted-foreground">
          <p>{label("requirements.empty")}</p>

          <Button radius="xl" variant="brand" className="mt-4" asChild>
            <Link href={O.associationTabHref("requirements")}>
              <L.Plus className="h-4 w-4" />
              {label("requirements.emptyAction")}
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {shown.map((row) => (
              <li
                key={row.requirementId}
                className="rounded-2xl border border-glass-border bg-background/50 p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="min-w-0 flex-1 truncate font-medium">
                    {row.requirementName}
                  </p>

                  <p className="text-sm tabular-nums">
                    {REPORTS.formatReportPercent(row.averagePercent, locale)}
                  </p>
                </div>

                <Progress
                  className="mt-3 h-2"
                  value={Math.min(row.averagePercent, 100)}
                  aria-label={label("requirements.progressLabel", {
                    name: row.requirementName,
                  })}
                />

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    {label("requirements.members", {
                      count: row.memberCount.toLocaleString(locale),
                    })}
                  </span>

                  <span className="tabular-nums">
                    {label("requirements.credits", {
                      earned: Math.round(
                        row.averageCompletedCredits,
                      ).toLocaleString(locale),
                      required: row.requiredCredits.toLocaleString(locale),
                    })}
                  </span>

                  <span>{deadlineOf(row)}</span>

                  <span>
                    {REPORTS.formatReportDate(row.dueDate, locale, none)}
                  </span>

                  {row.awaitingReviewCount > 0 && (
                    <Badge variant="orange">
                      {label("requirements.awaitingReview", {
                        count: row.awaitingReviewCount.toLocaleString(locale),
                      })}
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {requirements.length > shown.length && (
            <p className="mt-3 text-xs text-muted-foreground">
              {label("requirements.truncated", {
                shown: shown.length.toLocaleString(locale),
                total: requirements.length.toLocaleString(locale),
              })}
            </p>
          )}
        </>
      )}
    </AssociationOverviewPanel>
  );
};
