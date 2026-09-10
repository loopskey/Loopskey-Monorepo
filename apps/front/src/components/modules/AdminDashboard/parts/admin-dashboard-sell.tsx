"use client";

import { DashboardContentSkeleton } from "@layouts/parts/DashboardSkeleton";
import { TAdminDashboardTab } from "@/types/admin-dashboard.types";
import { useSearchParams } from "next/navigation";

import dynamic from "next/dynamic";

const AdminAssociationsTab = dynamic(
  () => import("@modules/AdminDashboard/AdminAssociationsTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const AdminOrgAccessRequestTab = dynamic(
  () => import("@modules/AdminDashboard/AdminOrgAccessRequestTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const AdminSettingsTab = dynamic(
  () => import("@modules/AdminDashboard/AdminSettingsTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const AdminOrgUsersTab = dynamic(
  () => import("@modules/AdminDashboard/AdminOrgUsersTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const AdminOverviewTab = dynamic(
  () => import("@modules/AdminDashboard/AdminOverviewTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const AdminUsersTab = dynamic(
  () => import("@modules/AdminDashboard/AdminUsersTab"),
  { loading: () => <DashboardContentSkeleton /> },
);
const AdminIngestionTab = dynamic(
  () => import("@modules/AdminDashboard/AdminIngestionTab"),
  { loading: () => <DashboardContentSkeleton /> },
);

const validTabs: TAdminDashboardTab[] = [
  "users",
  "overview",
  "settings",
  "ingestion",
  "organization-users",
  "org-access-requests",
  "associations",
];

export const AdminDashboardShell = () => {
  const searchParams = useSearchParams();

  const tabParam = searchParams?.get("tab") as TAdminDashboardTab | null;

  const activeTab: TAdminDashboardTab =
    tabParam && validTabs.includes(tabParam) ? tabParam : "overview";

  if (activeTab === "users") return <AdminUsersTab />;
  if (activeTab === "overview") return <AdminOverviewTab />;
  if (activeTab === "organization-users") return <AdminOrgUsersTab />;
  if (activeTab === "org-access-requests") return <AdminOrgAccessRequestTab />;
  if (activeTab === "associations") return <AdminAssociationsTab />;
  if (activeTab === "ingestion") return <AdminIngestionTab />;
  if (activeTab === "settings") return <AdminSettingsTab />;

  return (
    <div className="rounded-lg border p-8">
      Provider tab: {activeTab}
    </div>
  );
};
