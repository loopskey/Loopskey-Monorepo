"use client";

import { useAdminOrganizationUsersTab } from "@/hooks/useAdminOrgUsersTab";
import { DataTableFilters } from "@elements/data-table/data-table-filters";
import { MemberEditPanel } from "@modules/AdminDashboard/parts/member-edit-panel";
import { DataTable } from "@elements/data-table/data-table";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

type Props = {
  hook: ReturnType<typeof useAdminOrganizationUsersTab>;
};

const MEMBERS = "adminDashboard.organizationUsers.members";
const ALL = "ALL";

export const AdminOrganizationMembersTab = ({ hook }: Props) => {
  const {
    t,
    members,
    isLoading,
    memberPage,
    saveMember,
    selectedOrg,
    memberSearch,
    memberStatus,
    membersQuery,
    hasNextMember,
    nextMemberPage,
    setMemberSearch,
    setMemberStatus,
    editingMemberId,
    deactivateMember,
    previousMemberPage,
    resetMemberFilters,
    setEditingMemberId,
    hasActiveMemberFilters,
    memberStatusSelectOptions,
  } = hook;

  const editingMember = members.find((member) => member.id === editingMemberId);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium">{t(`${MEMBERS}.title`)}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(`${MEMBERS}.description`)}
        </p>
      </div>

      {editingMember && selectedOrg ? (
        <MemberEditPanel
          t={t}
          onSave={saveMember}
          item={editingMember}
          key={editingMember.id}
          onCancel={() => setEditingMemberId(null)}
          departments={selectedOrg.departments ?? []}
        />
      ) : null}

      <DataTable
        rows={members}
        isError={membersQuery.isError}
        rowKey={(member) => member.id}
        caption={t(`${MEMBERS}.title`)}
        selectedRowKey={editingMemberId}
        isLoading={membersQuery.isLoading}
        isFiltered={hasActiveMemberFilters}
        isFetching={membersQuery.isFetching}
        onRetry={() => void membersQuery.refetch()}
        empty={{ icon: L.Users, title: t(`${MEMBERS}.empty`) }}
        rowLabel={(member) => member.fullName ?? member.email ?? member.id}
        pagination={{
          kind: "cursor",
          page: memberPage,
          onNext: nextMemberPage,
          hasNextPage: hasNextMember,
          onPrevious: previousMemberPage,
          total: membersQuery.data?.totalCount,
        }}
        toolbar={
          <DataTableFilters
            isFiltered={hasActiveMemberFilters}
            onReset={resetMemberFilters}
            search={{
              value: memberSearch,
              onChange: setMemberSearch,
              label: t(`${MEMBERS}.search`),
              placeholder: t(`${MEMBERS}.search`),
            }}
            filters={[
              {
                type: "select",
                id: "status",
                value: memberStatus,
                defaultValue: ALL,
                onChange: setMemberStatus,
                label: t(`${MEMBERS}.status`),
                options: memberStatusSelectOptions,
              },
            ]}
          />
        }
        columns={[
          {
            id: "name",
            mobile: "title",
            header: t(`${MEMBERS}.name`),
            cell: (member) => (
              <span className="font-medium">{member.fullName ?? "-"}</span>
            ),
          },
          {
            id: "status",
            mobile: "badge",
            header: t(`${MEMBERS}.status`),
            cell: (member) => <Badge>{member.status}</Badge>,
          },
          {
            id: "email",
            mobile: "wide",
            header: t(`${MEMBERS}.email`),
            cell: (member) => member.email ?? "-",
          },
          {
            id: "role",
            header: t(`${MEMBERS}.role`),
            cell: (member) => member.jobRole ?? "-",
          },
          {
            id: "pdus",
            align: "end",
            header: t(`${MEMBERS}.pdus`),
            cell: (member) => member.pdus,
          },
          {
            id: "compliance",
            align: "end",
            header: t(`${MEMBERS}.compliance`),
            cell: (member) => `${member.compliance}%`,
          },
          {
            id: "courses",
            align: "end",
            header: t(`${MEMBERS}.courses`),
            cell: (member) => member.completedLearning,
          },
        ]}
        rowActions={(member) => [
          {
            id: "edit",
            icon: L.Pencil,
            label: t(`${MEMBERS}.edit`),
            onSelect: () => setEditingMemberId(member.id),
          },
          {
            id: "remove",
            tone: "danger",
            icon: L.Trash2,
            isPending: isLoading,
            label: t(`${MEMBERS}.remove`),
            onSelect: () => deactivateMember(member.id),
            confirm: {
              title: t("adminDashboard.organizationUsers.confirmRemove.title"),
              description: t(
                "adminDashboard.organizationUsers.confirmRemove.description",
              ),
              confirmLabel: t("common.confirm"),
              cancelLabel: t("common.cancel"),
            },
          },
        ]}
      />
    </div>
  );
};
