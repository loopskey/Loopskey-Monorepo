"use client";

import { Fragment } from "react";

import { useAdminOrganizationUsersTab } from "@/hooks/useAdminOrgUsersTab";
import { MemberEditRow } from "@modules/AdminDashboard/parts/member-edit-row";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { ContentPagination } from "@elements/pagination";
import { ConfirmDialog } from "@elements/confirm-dialog";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as F from "@ui/form";
import * as L from "lucide-react";

type Props = {
  hook: ReturnType<typeof useAdminOrganizationUsersTab>;
};

export const AdminOrganizationMembersTab = ({ hook }: Props) => {
  const {
    t,
    memberFilterRhf,
    memberStatusSelectOptions,
    selectedOrg,
    members,
    membersQuery,
    memberPage,
    hasNextMember,
    canPreviousMember,
    nextMemberPage,
    previousMemberPage,
    resetMemberFilters,
    hasActiveMemberFilters,
    isLoading,
    editingMemberId,
    setEditingMemberId,
    saveMember,
    deactivateMember,
  } = hook;

  return (
    <>
      <GlassCard glow={false} className="p-4">
        <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <h3 className="font-medium">
              {t("adminDashboard.organizationUsers.members.title")}
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("adminDashboard.organizationUsers.members.description")}
            </p>
          </div>

          <Button
            radius="xl"
            type="button"
            variant="glass"
            disabled={!hasActiveMemberFilters || isLoading}
            onClick={resetMemberFilters}
          >
            <L.RotateCcw className="h-4 w-4" />
            {t("common.reset")}
          </Button>
        </div>

        <F.Form {...memberFilterRhf}>
          <form className="grid gap-3 md:grid-cols-[1fr_240px]">
            <FloatingInputField
              name="search"
              control={memberFilterRhf.control}
              leftIcon={<L.Search className="h-4 w-4" />}
              label={t("adminDashboard.organizationUsers.members.search")}
            />

            <FloatingSelectField
              name="status"
              control={memberFilterRhf.control}
              options={memberStatusSelectOptions}
              label={t("adminDashboard.organizationUsers.members.status")}
              placeholder={t("common.all")}
            />
          </form>
        </F.Form>
      </GlassCard>

      <div className="overflow-x-auto rounded-3xl border border-glass-border">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">
                {t("adminDashboard.organizationUsers.members.name")}
              </th>
              <th className="px-4 py-3">
                {t("adminDashboard.organizationUsers.members.email")}
              </th>
              <th className="px-4 py-3">
                {t("adminDashboard.organizationUsers.members.status")}
              </th>
              <th className="px-4 py-3">
                {t("adminDashboard.organizationUsers.members.role")}
              </th>
              <th className="px-4 py-3">PDUs</th>
              <th className="px-4 py-3">Compliance</th>
              <th className="px-4 py-3">Courses</th>
              <th className="px-4 py-3">
                {t("adminDashboard.organizationUsers.table.actions")}
              </th>
            </tr>
          </thead>

          <tbody>
            {members.length ? (
              members.map((member) => (
                <Fragment key={member.id}>
                  <tr className="border-t border-glass-border">
                    <td className="px-4 py-3 font-medium">
                      {member.fullName ?? "-"}
                    </td>

                    <td className="px-4 py-3 text-muted-foreground">
                      {member.email ?? "-"}
                    </td>

                    <td className="px-4 py-3">
                      <Badge>{member.status}</Badge>
                    </td>

                    <td className="px-4 py-3">{member.jobRole ?? "-"}</td>

                    <td className="px-4 py-3">{member.pdus}</td>

                    <td className="px-4 py-3">{member.compliance}%</td>

                    <td className="px-4 py-3">{member.completedLearning}</td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          radius="xl"
                          type="button"
                          variant="glass"
                          onClick={() => setEditingMemberId(member.id)}
                        >
                          <L.Pencil className="h-4 w-4" />
                        </Button>

                        <ConfirmDialog
                          isLoading={isLoading}
                          title={t(
                            "adminDashboard.organizationUsers.confirmRemove.title",
                          )}
                          description={t(
                            "adminDashboard.organizationUsers.confirmRemove.description",
                          )}
                          confirmText={t("common.confirm")}
                          cancelText={t("common.cancel")}
                          confirmVariant="cancel"
                          onConfirm={() => deactivateMember(member.id)}
                          trigger={
                            <Button
                              size="sm"
                              radius="xl"
                              type="button"
                              variant="cancel"
                            >
                              <L.Trash2 className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </div>
                    </td>
                  </tr>

                  {editingMemberId === member.id && selectedOrg && (
                    <MemberEditRow
                      t={t}
                      item={member}
                      departments={selectedOrg.departments ?? []}
                      onSave={saveMember}
                      onCancel={() => setEditingMemberId(null)}
                    />
                  )}
                </Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  {t("adminDashboard.organizationUsers.members.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ContentPagination
        page={memberPage}
        onNext={nextMemberPage}
        hasNextPage={hasNextMember}
        canPrevious={canPreviousMember}
        onPrevious={previousMemberPage}
        isLoading={membersQuery.isFetching}
        totalCount={membersQuery.data?.totalCount}
      />
    </>
  );
};
