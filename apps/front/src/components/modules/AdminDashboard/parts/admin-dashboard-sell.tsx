"use client";

import { DashboardContentSkeleton } from "@layouts/parts/DashboardSkeleton";
import { TAdminDashboardTab } from "@/types/admin-dashboard.types";
import { useSearchParams } from "next/navigation";

import dynamic from "next/dynamic";

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

const validTabs: TAdminDashboardTab[] = [
  "users",
  "overview",
  "settings",
  "organization-users",
  "org-access-requests",
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
  if (activeTab === "settings") return <AdminSettingsTab />;

  return (
    <div className="rounded-[2rem] border border-glass-border bg-background/60 p-8 backdrop-blur-xl">
      Provider tab: {activeTab}
    </div>
  );
};
