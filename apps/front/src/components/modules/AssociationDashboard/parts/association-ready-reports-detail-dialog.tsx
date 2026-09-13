"use client";

import { TAssociationReadyReportsDialog } from "@/types/association-dashboard.types";
import { AssociationAttentionSection } from "@/lib/graphql/base";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as REPORTS from "@utils/association-reports";
import * as X from "@utils/association-report-exports";
import * as DIALOG from "@ui/dialog";
import * as L from "lucide-react";

const STATE_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  READY: "default",
  PENDING: "secondary",
  FAILED: "destructive",
  EXPIRED: "secondary",
};

export const AssociationReadyReportsDetailDialog = ({
  hook,
}: TAssociationReadyReportsDialog) => {
  const { t, locale, viewingSection, closeDetails, readyReports, isReportsLoading } =
    hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.messages.${key}`, vars);

  const none = t("associationDashboard.reports.table.none");

  const isOpen = viewingSection === AssociationAttentionSection.ReadyReports;

  return (
    <DIALOG.Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeDetails();
      }}
    >
      <DIALOG.DialogContent className="glass-dialog max-h-[85vh] overflow-y-auto border-border sm:max-w-2xl">
        <DIALOG.DialogHeader>
          <DIALOG.DialogTitle>
            {label("detail.title", {
              title: label("sections.READY_REPORTS.title"),
            })}
          </DIALOG.DialogTitle>
          <DIALOG.DialogDescription>
            {label("sections.READY_REPORTS.description")}
          </DIALOG.DialogDescription>
        </DIALOG.DialogHeader>

        {isReportsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-md" />
            <Skeleton className="h-16 w-full rounded-md" />
          </div>
        ) : readyReports.length === 0 ? (
          <p className="rounded-md border p-4 text-sm text-muted-foreground">
            {label("detail.empty")}
          </p>
        ) : (
          <ul className="space-y-2">
            {readyReports.map((record) => (
              <li
                key={record.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
              >
                <div className="min-w-0">
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
                      X.formatExportPeriod(record.filter, t, locale, none),
                      REPORTS.formatReportDate(record.createdAt, locale, none),
                    ].join(" · ")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={STATE_VARIANT[record.state] ?? "outline"}>
                    {t(`associationDashboard.reports.exports.states.${record.state}`)}
                  </Badge>

                  <Button
                    size="sm"
                    radius="xl"
                    type="button"
                    variant="outline"
                    onClick={() =>
                      void X.downloadAssociationReportExport(record)
                    }
                  >
                    <L.Download className="h-4 w-4" />
                    {label("detail.download")}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <DIALOG.DialogFooter>
          <Button
            radius="xl"
            type="button"
            variant="outline"
            onClick={closeDetails}
          >
            <L.X className="h-4 w-4" />
            {label("detail.close")}
          </Button>
        </DIALOG.DialogFooter>
      </DIALOG.DialogContent>
    </DIALOG.Dialog>
  );
};
