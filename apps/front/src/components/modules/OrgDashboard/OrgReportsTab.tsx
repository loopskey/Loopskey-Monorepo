"use client";

import { OrgReportsDepartmentPieChart } from "@modules/OrgDashboard/parts/org-reports-pie-chart";
import { OrgReportsTopMembersTable } from "@modules/OrgDashboard/parts/org-reports-top-members-table";
import { OrgReportsBreakdownChart } from "@modules/OrgDashboard/parts/org-reports-breakdown-chart";
import { OrgReportsSummaryCards } from "@modules/OrgDashboard/parts/org-reports-card";
import { OrgReportsTrendChart } from "@modules/OrgDashboard/parts/org-reports-trend-chart";
import { OrgReportsFilters } from "@modules/OrgDashboard/parts/org-reports-filters";
import { useOrgReportsTab } from "@/hooks/useOrgReportTab";
import { OrgReportsHeader } from "@modules/OrgDashboard/parts/org-reports-header";

const OrgReportsTab = () => {
  const hook = useOrgReportsTab();

  return (
    <div className="space-y-6 print:bg-white">
      <OrgReportsHeader hook={hook} />
      <OrgReportsFilters hook={hook} />
      <OrgReportsSummaryCards hook={hook} />
      <div className="grid gap-6 xl:grid-cols-3">
        <OrgReportsTrendChart hook={hook} />
        <OrgReportsDepartmentPieChart hook={hook} />
      </div>
      <OrgReportsBreakdownChart hook={hook} />
      <OrgReportsTopMembersTable hook={hook} />
    </div>
  );
};

export default OrgReportsTab;
