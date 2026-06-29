"use client";

import { AdminOrganizationUsersFilters } from "@modules/AdminDashboard/parts/admin-org-users-filter";
import { useAdminOrganizationUsersTab } from "@/hooks/useAdminOrgUsersTab";
import { AdminOrganizationUsersHeader } from "@modules/AdminDashboard/parts/admin-org-users-header";
import { AdminOrganizationDetailView } from "@modules/AdminDashboard/parts/admin-org-detail-view";
import { AdminOrganizationUsersTable } from "@modules/AdminDashboard/parts/admin-org-users-table";
import { ContentPagination } from "@elements/pagination";

const AdminOrganizationUsersTab = () => {
  const hook = useAdminOrganizationUsersTab();
  if (hook.selectedOrgId) return <AdminOrganizationDetailView hook={hook} />;
  return (
    <div className="space-y-6">
      <AdminOrganizationUsersHeader hook={hook} />
      <AdminOrganizationUsersFilters hook={hook} />
      <AdminOrganizationUsersTable hook={hook} />
      <ContentPagination
        page={hook.orgPage}
        onNext={hook.nextOrgPage}
        hasNextPage={hook.hasNextOrg}
        onPrevious={hook.previousOrgPage}
        canPrevious={hook.canPreviousOrg}
        isLoading={hook.organizationsQuery.isFetching}
        totalCount={hook.organizationsQuery.data?.totalCount}
      />
    </div>
  );
};

export default AdminOrganizationUsersTab;
