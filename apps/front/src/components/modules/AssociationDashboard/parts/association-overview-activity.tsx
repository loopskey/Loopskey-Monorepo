"use client";

import { TAssociationOverviewActivity } from "@/types/association-dashboard.types";
import { AssociationOverviewPanel } from "@modules/AssociationDashboard/parts/association-overview-panel";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import Link from "next/link";

import * as REPORTS from "@utils/association-reports";
import * as O from "@utils/association-overview";
import * as L from "lucide-react";

export const AssociationOverviewActivity = ({
  hook,
}: TAssociationOverviewActivity) => {
  const { t, locale, activity, activityPanel } = hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.overview.${key}`, vars);

  const none = t("associationDashboard.reports.table.none");

  return (
    <AssociationOverviewPanel
      isError={activityPanel.isError}
      isLoading={activityPanel.isLoading}
      retry={activityPanel.retry}
      retryLabel={label("retry")}
      errorMessage={label("activity.error")}
      title={label("activity.title")}
      description={label("activity.description")}
      skeleton={
        <ul className="space-y-2">
          {[0, 1, 2, 3].map((row) => (
            <li key={row}>
              <Skeleton className="h-16 w-full rounded-md" />
            </li>
          ))}
        </ul>
      }
      action={
        <Button size="sm" radius="xl" variant="outline" asChild>
          <Link href={O.associationTabHref("members")}>
            <L.ArrowUpRight className="h-4 w-4" />
            {label("activity.openTab")}
          </Link>
        </Button>
      }
    >
      {activity.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-5 text-sm text-muted-foreground">
          <p>{label("activity.empty")}</p>

          <Button radius="xl" className="mt-4" asChild>
            <Link href={O.associationTabHref("learning-content")}>
              <L.ArrowUpRight className="h-4 w-4" />
              {label("activity.emptyAction")}
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {activity.map((row) => (
            <li key={row.id}>
              <Link
                href={O.memberDetailHref(row.memberId)}
                className="flex flex-wrap items-center gap-3 rounded-md border p-3 transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {row.activityTitle}
                  </span>

                  <span className="block truncate text-xs text-muted-foreground">
                    {[
                      row.memberName ?? none,
                      row.requirementName,
                      REPORTS.formatReportDate(row.activityDate, locale, none),
                    ].join(" · ")}
                  </span>
                </span>

                <span className="text-sm tabular-nums">
                  {label("activity.credits", {
                    credits: row.credits.toLocaleString(locale),
                  })}
                </span>

                <Badge variant={O.ACTIVITY_STATE_VARIANTS[row.state]}>
                  {label(`activity.states.${row.state}`)}
                </Badge>

                {O.isAwaitingReview(row.state) && (
                  <span className="inline-flex items-center gap-1 text-xs text-primary">
                    {label("activity.review")}
                    <L.ChevronRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AssociationOverviewPanel>
  );
};
