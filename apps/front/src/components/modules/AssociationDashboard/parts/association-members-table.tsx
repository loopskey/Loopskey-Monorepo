"use client";

import { memberDetailHref, memberEditHref } from "@utils/association-overview";
import { TAssociationMembersTable } from "@/types/association-dashboard.types";
import { AssociationMemberStatus } from "@/lib/graphql/base";
import { AssociationInvitationStatus } from "./association-invitation-status";
import { DataTableFilters } from "@elements/data-table/data-table-filters";
import { DataTable } from "@elements/data-table/data-table";
import { Progress } from "@ui/progress";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import Link from "next/link";

import * as L from "lucide-react";

const MEMBERS = "associationDashboard.members";
const ALL = "ALL";

const STATUSES = [
  AssociationMemberStatus.Active,
  AssociationMemberStatus.PendingActivation,
  AssociationMemberStatus.Inactive,
];

const statusVariant = (status: AssociationMemberStatus) => {
  if (status === AssociationMemberStatus.Active) return "default" as const;
  if (status === AssociationMemberStatus.PendingActivation)
    return "orange" as const;
  return "secondary" as const;
};

export const AssociationMembersTable = ({ hook }: TAssociationMembersTable) => {
  const {
    t,
    page,
    search,
    status,
    groupId,
    members,
    nextPage,
    setSearch,
    setStatus,
    isFiltered,
    setGroupId,
    openInvite,
    totalCount,
    hasNextPage,
    groupOptions,
    isRefetching,
    hasNoMembers,
    previousPage,
    resetFilters,
    requirementId,
    setRequirementId,
    requirementOptions,
    resendMemberInvitation,
    isResendingInvitation,
  } = hook;

  const focusImport = () =>
    document.getElementById("association-import-file")?.focus();

  return (
    <DataTable
      isFetching={isRefetching}
      rowKey={(member) => member.id}
      rows={hasNoMembers ? [] : members}
      caption={t(`${MEMBERS}.table.caption`)}
      isFiltered={isFiltered && !hasNoMembers}
      rowLabel={(member) => member.fullName ?? member.email ?? ""}
      pagination={{
        kind: "cursor",
        page,
        hasNextPage,
        total: totalCount,
        onNext: nextPage,
        onPrevious: previousPage,
      }}
      empty={{
        icon: L.Users,
        title: t(`${MEMBERS}.empty.firstRunTitle`),
        description: t(`${MEMBERS}.empty.firstRunBody`),
        action: (
          <>
            <Button radius="lg" type="button" onClick={openInvite}>
              <L.UserPlus aria-hidden />
              {t(`${MEMBERS}.empty.inviteOne`)}
            </Button>
            <Button
              radius="lg"
              type="button"
              variant="outline"
              onClick={focusImport}
            >
              <L.FileSpreadsheet aria-hidden />
              {t(`${MEMBERS}.empty.importMany`)}
            </Button>
          </>
        ),
      }}
      filteredEmpty={{
        icon: L.SearchX,
        title: t(`${MEMBERS}.empty.noResultsTitle`),
        description: t(`${MEMBERS}.empty.noResultsBody`),
        action: (
          <Button
            radius="lg"
            type="button"
            variant="outline"
            onClick={resetFilters}
          >
            <L.FilterX aria-hidden />
            {t(`${MEMBERS}.filters.clear`)}
          </Button>
        ),
      }}
      toolbar={
        <DataTableFilters
          isFiltered={isFiltered}
          onReset={resetFilters}
          search={{
            value: search,
            onChange: setSearch,
            label: t(`${MEMBERS}.filters.search`),
            placeholder: t(`${MEMBERS}.filters.searchPlaceholder`),
          }}
          filters={[
            {
              type: "select",
              id: "group",
              value: groupId,
              defaultValue: ALL,
              onChange: setGroupId,
              label: t(`${MEMBERS}.filters.group`),
              options: [
                { value: ALL, label: t(`${MEMBERS}.filters.allGroups`) },
                ...groupOptions,
              ],
            },
            requirementOptions.length > 0 && {
              type: "select",
              id: "requirement",
              value: requirementId,
              defaultValue: ALL,
              onChange: setRequirementId,
              label: t(`${MEMBERS}.filters.requirement`),
              options: [
                { value: ALL, label: t(`${MEMBERS}.filters.allRequirements`) },
                ...requirementOptions,
              ],
            },
            {
              type: "select",
              id: "status",
              value: status,
              defaultValue: ALL,
              onChange: setStatus,
              label: t(`${MEMBERS}.filters.status`),
              options: [
                { value: ALL, label: t(`${MEMBERS}.filters.allStatuses`) },
                ...STATUSES.map((value) => ({
                  value,
                  label: t(`${MEMBERS}.status.${value}`),
                })),
              ],
            },
          ]}
        />
      }
      columns={[
        {
          id: "name",
          mobile: "title",
          header: t(`${MEMBERS}.table.name`),
          cell: (member) => (
            <Link
              href={memberDetailHref(member.id)}
              className="block rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/35"
            >
              <span className="block font-medium">
                {member.fullName ?? "-"}
              </span>
              <span className="block text-xs font-normal text-muted-foreground">
                {member.email ?? "-"}
              </span>
            </Link>
          ),
        },
        {
          id: "status",
          mobile: "badge",
          header: t(`${MEMBERS}.table.status`),
          cell: (member) => (
            <div className="space-y-1.5">
              <Badge variant={statusVariant(member.status)}>
                {t(`${MEMBERS}.status.${member.status}`)}
              </Badge>
              {member.status === AssociationMemberStatus.PendingActivation && (
                <AssociationInvitationStatus
                  delivery={member.invitationDelivery}
                />
              )}
            </div>
          ),
        },
        {
          id: "memberNumber",
          header: t(`${MEMBERS}.table.memberNumber`),
          cell: (member) => member.memberNumber ?? "-",
        },
        {
          id: "group",
          header: t(`${MEMBERS}.table.group`),
          cell: (member) => member.group?.title ?? "-",
        },
        {
          id: "requirementAssigned",
          mobile: "wide",
          className: "max-w-56 whitespace-normal",
          header: t(`${MEMBERS}.table.requirementAssigned`),
          cell: (member) =>
            member.requirementNames.length > 0
              ? member.requirementNames.join(", ")
              : t(`${MEMBERS}.table.noRequirement`),
        },
        {
          id: "progress",
          header: t(`${MEMBERS}.table.progress`),
          cell: (member) =>
            member.complianceSummary ? (
              <span className="flex items-center gap-2">
                <Progress
                  className="h-1.5 w-20"
                  value={Math.round(member.complianceSummary.percent)}
                />
                <span className="text-xs tabular-nums text-muted-foreground">
                  {Math.round(member.complianceSummary.percent)}%
                </span>
              </span>
            ) : (
              "-"
            ),
        },
        {
          id: "evidence",
          header: t(`${MEMBERS}.table.evidence`),
          cell: (member) =>
            member.complianceSummary ? (
              member.complianceSummary.isMissingEvidence ? (
                <Badge variant="destructive">
                  {t(`${MEMBERS}.table.evidenceMissing`)}
                </Badge>
              ) : (
                <Badge variant="secondary">
                  {t(`${MEMBERS}.table.evidenceOk`)}
                </Badge>
              )
            ) : (
              "-"
            ),
        },
      ]}
      rowActions={(member) => [
        ...(member.status === AssociationMemberStatus.PendingActivation
          ? [
              {
                id: "resend",
                icon: L.Mail,
                label: t(`${MEMBERS}.invite.resend`),
                isDisabled: isResendingInvitation,
                isPending: isResendingInvitation,
                onSelect: () => resendMemberInvitation(member.id),
              },
            ]
          : []),
        {
          id: "view",
          icon: L.Eye,
          href: memberDetailHref(member.id),
          label: t("common.view"),
        },
        {
          id: "edit",
          icon: L.Pencil,
          href: memberEditHref(member.id),
          label: t("common.edit"),
        },
      ]}
    />
  );
};
