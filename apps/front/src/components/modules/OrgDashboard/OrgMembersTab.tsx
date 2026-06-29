"use client";

import { useOrganizationMembersTab } from "@/hooks/useOrgMemberTab";
import { OrgMemberDetailView } from "@modules/OrgDashboard/parts/org-member-detail-view";
import { OrgMembersBulkCard } from "@modules/OrgDashboard/parts/org-members-bulk-card";
import { ContentPagination } from "@elements/pagination";
import { OrgMembersAddCard } from "@modules/OrgDashboard/parts/org-members-add-card";
import { OrgMembersFilters } from "@modules/OrgDashboard/parts/org-members-filters";
import { OrgMembersHeader } from "@modules/OrgDashboard/parts/org-members-header";
import { OrgMembersStats } from "@modules/OrgDashboard/parts/org-members-stats";
import { OrgMembersTable } from "@modules/OrgDashboard/parts/org-members-table";
import { GlassCard } from "@elements/glass-card";

const OrgMembersTab = () => {
  const membersTab = useOrganizationMembersTab();

  const {
    page,
    stats,
    members,
    nextPage,
    isLoading,
    totalCount,
    canPrevious,
    hasNextPage,
    previousPage,
  } = membersTab;

  if (membersTab.isDetailOpen) return <OrgMemberDetailView hook={membersTab} />;

  return (
    <div className="space-y-6">
      <OrgMembersHeader t={membersTab.t} />

      <OrgMembersStats stats={stats} totalCount={totalCount} t={membersTab.t} />

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-6">
          <OrgMembersAddCard
            t={membersTab.t}
            isLoading={isLoading}
            addMemberForm={membersTab.addMemberForm}
            departmentOptions={membersTab.departmentOptions}
            submitSingleMember={membersTab.submitSingleMember}
          />

          <OrgMembersBulkCard
            t={membersTab.t}
            isLoading={isLoading}
            uploadBulkMembers={membersTab.uploadBulkMembers}
          />
        </div>

        <GlassCard>
          <div className="relative z-10">
            <OrgMembersFilters
              t={membersTab.t}
              search={membersTab.search}
              status={membersTab.status}
              setSearch={membersTab.setSearch}
              setStatus={membersTab.setStatus}
              departments={membersTab.departments}
              departmentId={membersTab.departmentId}
              setDepartmentId={membersTab.setDepartmentId}
            />

            <OrgMembersTable
              t={membersTab.t}
              members={members}
              isLoading={isLoading}
              openMemberDetail={membersTab.openMemberDetail}
            />

            <ContentPagination
              page={page}
              className="mt-6"
              onNext={nextPage}
              isLoading={isLoading}
              totalCount={totalCount}
              canPrevious={canPrevious}
              onPrevious={previousPage}
              hasNextPage={hasNextPage}
            />
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default OrgMembersTab;
