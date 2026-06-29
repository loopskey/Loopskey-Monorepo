"use client";

import { OrgReportStatCard } from "@modules/OrgDashboard/parts/org-report-stat-card";
import { TOrgReportCard } from "@/types/org-dashboard.types";

import * as L from "lucide-react";

export const OrgReportsSummaryCards = ({ hook }: TOrgReportCard) => {
  const { t, summary } = hook;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <OrgReportStatCard
        icon={L.UsersRound}
        value={summary?.totalMembers ?? 0}
        label={t("organizationDashboard.reports.summary.members")}
      />

      <OrgReportStatCard
        icon={L.Clock3}
        value={summary?.requiredHours ?? 0}
        label={t("organizationDashboard.reports.summary.requiredHours")}
      />

      <OrgReportStatCard
        icon={L.Activity}
        value={`${Math.round(summary?.averageCompliance ?? 0)}%`}
        label={t("organizationDashboard.reports.summary.avgCompliance")}
      />

      <OrgReportStatCard
        icon={L.Target}
        value={Number(summary?.averagePdus ?? 0).toFixed(2)}
        label={t("organizationDashboard.reports.summary.avgPdus")}
      />
    </div>
  );
};
