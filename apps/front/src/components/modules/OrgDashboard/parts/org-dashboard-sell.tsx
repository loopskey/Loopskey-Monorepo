"use client";

import { DashboardContentSkeleton } from "@layouts/parts/DashboardSkeleton";
import { TOrgDashboardTab } from "@/types/org-dashboard.types";
import { useSearchParams } from "next/navigation";

import dynamic from "next/dynamic";

const OrgCDPCategoriesTab = dynamic(
  () => import("@modules/OrgDashboard/OrgCDPCategoriesTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const OrgEventCatalogTab = dynamic(
  () => import("@modules/OrgDashboard/OrgEventCatalogTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const OrgAssignmentsTab = dynamic(
  () => import("@modules/OrgDashboard/OrgAssignmentsTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const OrgSettingsTab = dynamic(
  () => import("@modules/OrgDashboard/OrgSettingsTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const OrgOverviewTab = dynamic(
  () => import("@modules/OrgDashboard/OrgOverviewTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const OrgReportsTab = dynamic(
  () => import("@modules/OrgDashboard/OrgReportsTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const OrgMembersTab = dynamic(
  () => import("@modules/OrgDashboard/OrgMembersTab"),
  { loading: () => <DashboardContentSkeleton /> },
);

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
