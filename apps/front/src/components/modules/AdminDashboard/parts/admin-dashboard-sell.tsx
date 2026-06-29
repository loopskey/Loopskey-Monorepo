"use client";

import { TAdminDashboardTab } from "@/types/admin-dashboard.types";
import { useSearchParams } from "next/navigation";

import AdminOrgAccessRequestTab from "@modules/AdminDashboard/AdminOrgAccessRequestTab";
import AdminSettingsTab from "@modules/AdminDashboard/AdminSettingsTab";
import AdminOrgUsersTab from "@modules/AdminDashboard/AdminOrgUsersTab";
import AdminOverviewTab from "@modules/AdminDashboard/AdminOverviewTab";
import AdminUsersTab from "@modules/AdminDashboard/AdminUsersTab";

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
