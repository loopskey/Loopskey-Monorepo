"use client";

import { TAssociationReportExportMenu } from "@/types/association-dashboard.types";
import { AssociationReportFormat } from "@/lib/graphql/base";
import { EXPORT_FORMATS } from "@utils/association-report-exports";
import { Button } from "@ui/button";

import * as DM from "@ui/dropdown-menu";
import * as L from "lucide-react";

const FORMAT_ICONS = {
  [AssociationReportFormat.Pdf]: L.FileText,
  [AssociationReportFormat.Excel]: L.Sheet,
} as const;

export const AssociationReportExportMenu = ({
  hook,
}: TAssociationReportExportMenu) => {
  const { t, report, createExport, isRequestingExport, isRangeIncomplete } =
    hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.reports.exports.${key}`, vars);

  return (
    <DM.DropdownMenu>
      <DM.DropdownMenuTrigger asChild>
        <Button
          radius="xl"
          type="button"
          variant="glass"
          disabled={isRequestingExport || isRangeIncomplete}
          aria-label={label("menuLabel", {
            report: t(
              `associationDashboard.reports.names.${report ?? "overview-summary"}`,
            ),
          })}
        >
          {isRequestingExport ? (
            <L.Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <L.Download className="h-4 w-4" />
          )}
          {label("action")}
        </Button>
      </DM.DropdownMenuTrigger>

      <DM.DropdownMenuContent align="end" className="w-56">
        <DM.DropdownMenuLabel>{label("menuHeading")}</DM.DropdownMenuLabel>

        <DM.DropdownMenuSeparator />

        {EXPORT_FORMATS.map((format) => {
          const Icon = FORMAT_ICONS[format];

          return (
            <DM.DropdownMenuItem
              key={format}
              onSelect={() => void createExport(format)}
            >
              <Icon className="h-4 w-4" />
              {label(`formats.${format}`)}
            </DM.DropdownMenuItem>
          );
        })}
      </DM.DropdownMenuContent>
    </DM.DropdownMenu>
  );
};
