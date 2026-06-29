"use client";

import { TOrgDashboardTab } from "@/types/org-dashboard.types";
import { useSearchParams } from "next/navigation";

import OrgCDPCategoriesTab from "@modules/OrgDashboard/OrgCDPCategoriesTab";
import OrgEventCatalogTab from "@modules/OrgDashboard/OrgEventCatalogTab";
import OrgAssignmentsTab from "@modules/OrgDashboard/OrgAssignmentsTab";
import OrgSettingsTab from "@modules/OrgDashboard/OrgSettingsTab";
import OrgOverviewTab from "@modules/OrgDashboard/OrgOverviewTab";
import OrgReportsTab from "@modules/OrgDashboard/OrgReportsTab";
import OrgMembersTab from "@modules/OrgDashboard/OrgMembersTab";

const validTabs: TOrgDashboardTab[] = [
  "members",
  "reports",
  "overview",
  "settings",
  "assignments",
  "event-catalog",
  "cpd-categories",
];

export const OrgDashboardShell = () => {
  const searchParams = useSearchParams();

  const tabParam = searchParams?.get("tab") as TOrgDashboardTab | null;

  const activeTab: TOrgDashboardTab =
    tabParam && validTabs.includes(tabParam) ? tabParam : "overview";

  if (activeTab === "members") return <OrgMembersTab />;
  if (activeTab === "reports") return <OrgReportsTab />;
  if (activeTab === "overview") return <OrgOverviewTab />;
  if (activeTab === "settings") return <OrgSettingsTab />;
  if (activeTab === "assignments") return <OrgAssignmentsTab />;
  if (activeTab === "event-catalog") return <OrgEventCatalogTab />;
  if (activeTab === "cpd-categories") return <OrgCDPCategoriesTab />;

  return (
    <div className="rounded-[2rem] border border-glass-border bg-background/60 p-8 backdrop-blur-xl">
      Provider tab: {activeTab}
    </div>
  );
};
