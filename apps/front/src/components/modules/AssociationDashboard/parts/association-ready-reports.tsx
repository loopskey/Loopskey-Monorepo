"use client";

import { TAssociationReadyReports } from "@/types/association-dashboard.types";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import Link from "next/link";

import * as REPORTS from "@utils/association-reports";
import * as X from "@utils/association-report-exports";
import * as L from "lucide-react";

const LIBRARY_HREF = "/dashboard/association?tab=reports";

export const AssociationReadyReports = ({ hook }: TAssociationReadyReports) => {
  const { t, locale, readyReports, isReportsLoading } = hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.messages.${key}`, vars);

  const none = t("associationDashboard.reports.table.none");

  return (
    <GlassCard glow={false}>
      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="rounded-2xl bg-primary/10 p-2.5 text-primary">
              <L.FileDown className="h-5 w-5" />
            </span>

            <div>
              <h2 className="font-medium">
                {label("sections.READY_REPORTS.title")}
              </h2>

              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                {label("sections.READY_REPORTS.description")}
              </p>
            </div>
          </div>

          <Badge variant={readyReports.length > 0 ? "secondary" : "outline"}>
            {label("section.countReports", {
              count: readyReports.length.toLocaleString(locale),
            })}
          </Badge>
        </div>

        {isReportsLoading ? (
          <div className="mt-5">
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
        ) : readyReports.length === 0 ? (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-glass-border bg-background/50 p-4 text-sm text-muted-foreground">
            <L.CircleCheck className="h-4 w-4 text-primary" />
            {label("sections.READY_REPORTS.settled")}
          </div>
        ) : (
          <ul className="mt-5 space-y-2">
            {readyReports.map((record) => (
              <li
                key={record.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-glass-border bg-background/50 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {t(
                      `associationDashboard.reports.names.${X.REPORT_KEY_OF[record.reportType]}`,
                    )}
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    {[
                      t(
                        `associationDashboard.reports.exports.formats.${record.format}`,
                      ),
                      REPORTS.formatReportDate(record.createdAt, locale, none),
                      X.formatExportSize(record.sizeBytes, locale, none),
                    ].join(" · ")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5">
          <Button radius="xl" variant="glass" asChild>
            <Link href={LIBRARY_HREF}>
              <L.ArrowUpRight className="h-4 w-4" />
              {label("sections.READY_REPORTS.action")}
            </Link>
          </Button>
        </div>
      </div>
    </GlassCard>
  );
};
