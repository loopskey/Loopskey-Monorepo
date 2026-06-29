"use client";

import { TOrgReportHeader } from "@/types/org-dashboard.types";
import { Button } from "@ui/button";

import * as L from "lucide-react";

export const OrgReportsHeader = ({ hook }: TOrgReportHeader) => {
  const { t, exportExcel, exportPdf } = hook;

  return (
    <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <p className="text-sm font-medium text-primary">
          {t("organizationDashboard.reports.eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
          {t("organizationDashboard.reports.title")}
        </h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          {t("organizationDashboard.reports.description")}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 print:hidden">
        <Button radius="xl" variant="glass" onClick={exportExcel}>
          <L.FileSpreadsheet className="h-4 w-4" />
          {t("organizationDashboard.reports.actions.exportExcel")}
        </Button>
        <Button radius="xl" variant="brand" onClick={exportPdf}>
          <L.FileText className="h-4 w-4" />
          {t("organizationDashboard.reports.actions.exportPdf")}
        </Button>
      </div>
    </section>
  );
};
