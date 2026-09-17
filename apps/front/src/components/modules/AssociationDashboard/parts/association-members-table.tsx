"use client";

import { TAssociationMembersTable } from "@/types/association-dashboard.types";
import { AssociationMemberStatus } from "@/lib/graphql/base";
import { TAssociationMemberRow } from "@/types/association-dashboard.types";
import { useRouter } from "next/navigation";
import { Skeleton } from "@ui/skeleton";
import { Progress } from "@ui/progress";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

import type { ReactNode } from "react";

type TMemberColumn = {
  id: string;
  header: string;
  cell: (member: TAssociationMemberRow) => ReactNode;
};

const statusVariant = (status: AssociationMemberStatus) => {
  if (status === AssociationMemberStatus.Active) return "default" as const;
  if (status === AssociationMemberStatus.PendingActivation)
    return "orange" as const;
  return "secondary" as const;
};

export const AssociationMembersTable = ({ hook }: TAssociationMembersTable) => {
  const router = useRouter();

  const openMember = (memberId: string) =>
    router.push(`/dashboard/association?tab=members&memberId=${memberId}`);

  const { t, members, isMutating, goToMember, isRefetching } = hook;

  const statusBadge = (member: TAssociationMemberRow) => (
    <Badge variant={statusVariant(member.status)}>
      {t(`associationDashboard.members.status.${member.status}`)}
    </Badge>
  );

  const columns: TMemberColumn[] = [
    {
      id: "name",
      header: t("associationDashboard.members.table.name"),
      cell: (member) => (
        <button
          type="button"
          className="text-left underline-offset-4 hover:underline"
          onClick={() => openMember(member.id)}
        >
          <span className="block font-medium">{member.fullName ?? "-"}</span>
          <span className="block text-xs text-muted-foreground">
            {member.email ?? "-"}
          </span>
        </button>
      ),
    },
    {
      id: "memberNumber",
      header: t("associationDashboard.members.table.memberNumber"),
      cell: (member) => member.memberNumber ?? "-",
    },
    {
      id: "group",
      header: t("associationDashboard.members.table.group"),
      cell: (member) => member.group?.title ?? "-",
    },
    {
      id: "status",
      header: t("associationDashboard.members.table.status"),
      cell: statusBadge,
    },
    {
      id: "requirementAssigned",
      header: t("associationDashboard.members.table.requirementAssigned"),
      cell: (member) =>
        member.requirementNames.length > 0
          ? member.requirementNames.join(", ")
          : t("associationDashboard.members.table.noRequirement"),
    },
    {
      id: "progress",
      header: t("associationDashboard.members.table.progress"),
      cell: (member) =>
        member.complianceSummary ? (
          <div className="flex items-center gap-2">
            <Progress
              className="h-2 w-20"
              value={Math.round(member.complianceSummary.percent)}
            />
            <span className="text-xs text-muted-foreground">
              {Math.round(member.complianceSummary.percent)}%
            </span>
          </div>
        ) : (
          "-"
        ),
    },
    {
      id: "evidence",
      header: t("associationDashboard.members.table.evidence"),
      cell: (member) =>
        member.complianceSummary ? (
          member.complianceSummary.isMissingEvidence ? (
            <Badge variant="destructive">
              {t("associationDashboard.members.table.evidenceMissing")}
            </Badge>
          ) : (
            <Badge variant="secondary">
              {t("associationDashboard.members.table.evidenceOk")}
            </Badge>
          )
        ) : (
          "-"
        ),
    },
  ];

  const rowActions = (member: TAssociationMemberRow) => (
    <div className="flex items-center justify-end gap-2">
      <Button
        size="icon"
        radius="xl"
        type="button"
        variant="outline"
        disabled={isMutating}
        onClick={() => goToMember(member.id, "edit")}
        aria-label={t("associationDashboard.members.table.editFor", {
          name: member.fullName ?? member.email ?? "",
        })}
      >
        <L.Pencil className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        radius="xl"
        type="button"
        variant="outline"
        onClick={() => openMember(member.id)}
        aria-label={t("associationDashboard.members.table.viewFor", {
          name: member.fullName ?? member.email ?? "",
        })}
      >
        <L.Eye className="h-4 w-4" />
      </Button>
    </div>
  );

  if (isRefetching) {
    return (
      <div className="mt-6 space-y-3" aria-busy="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1080px] text-left text-sm">
          <caption className="sr-only">
            {t("associationDashboard.members.table.caption")}
          </caption>

          <thead className="text-xs uppercase text-muted-foreground">
            <tr className="border-b border-border">
              {columns.map((column) => (
                <th key={column.id} scope="col" className="py-3">
                  {column.header}
                </th>
              ))}

              <th scope="col" className="py-3 text-right">
                {t("associationDashboard.members.table.actions")}
              </th>
            </tr>
          </thead>

          <tbody>
            {members.map((member) => (
              <tr
                key={member.id}
                className="border-b border-border/70 transition-colors hover:bg-primary/5"
              >
                {columns.map((column) => (
                  <td key={column.id} className="py-4 pr-4 align-middle">
                    {column.cell(member)}
                  </td>
                ))}

                <td className="py-4 text-right">{rowActions(member)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-6 space-y-3 md:hidden">
        {members.map((member) => (
          <li
            key={member.id}
            className="rounded-lg border p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{member.fullName ?? "-"}</p>
                <p className="text-xs text-muted-foreground">
                  {member.email ?? "-"}
                </p>
              </div>

              {rowActions(member)}
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {columns
                .filter((column) => column.id !== "name")
                .map((column) => (
                  <div key={column.id}>
                    <dt className="text-xs uppercase text-muted-foreground">
                      {column.header}
                    </dt>
                    <dd className="mt-1">{column.cell(member)}</dd>
                  </div>
                ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
};
