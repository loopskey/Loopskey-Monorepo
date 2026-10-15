"use client";

import { useAdminOrganizationUsersTab } from "@/hooks/useAdminOrgUsersTab";
import { AdminOrganizationUsersHeader } from "@modules/AdminDashboard/parts/admin-org-users-header";
import { AdminOrganizationDetailView } from "@modules/AdminDashboard/parts/admin-org-detail-view";
import { AdminOrganizationUsersTable } from "@modules/AdminDashboard/parts/admin-org-users-table";

const AdminOrganizationUsersTab = () => {
  const hook = useAdminOrganizationUsersTab();
  if (hook.selectedOrgId) return <AdminOrganizationDetailView hook={hook} />;
  return (
    <div className="space-y-6">
      <AdminOrganizationUsersHeader hook={hook} />
      <AdminOrganizationUsersTable hook={hook} />
    </div>
  );
};

export default AdminOrganizationUsersTab;
