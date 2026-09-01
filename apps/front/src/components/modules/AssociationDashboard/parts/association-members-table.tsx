"use client";

import { TAssociationMembersTable } from "@/types/association-dashboard.types";
import { AssociationMemberStatus } from "@/lib/graphql/base";
import { TAssociationMemberRow } from "@/types/association-dashboard.types";
import { ConfirmDialog } from "@elements/confirm-dialog";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as D from "@ui/dropdown-menu";
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
  const {
    t,
    members,
    isMutating,
    isRefetching,
    changeMemberStatus,
    resendMemberInvitation,
  } = hook;

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
        <div>
          <p className="font-medium">{member.fullName ?? "-"}</p>
          <p className="text-xs text-muted-foreground">{member.email ?? "-"}</p>
        </div>
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
  ];

  const rowActions = (member: TAssociationMemberRow) => {
    const isInactive = member.status === AssociationMemberStatus.Inactive;

    return (
      <D.DropdownMenu>
        <D.DropdownMenuTrigger asChild>
          <Button
            size="sm"
            radius="xl"
            type="button"
            variant="glass"
            disabled={isMutating}
            aria-label={t("associationDashboard.members.table.actionsFor", {
              name: member.fullName ?? member.email ?? "",
            })}
          >
            <L.MoreHorizontal className="h-4 w-4" />
          </Button>
        </D.DropdownMenuTrigger>

        <D.DropdownMenuContent align="end" className="z-[9999] rounded-2xl">
          {member.status === AssociationMemberStatus.PendingActivation && (
            <D.DropdownMenuItem
              onSelect={() => void resendMemberInvitation(member.id)}
            >
              <L.Send className="h-4 w-4" />
              {t("associationDashboard.members.actions.resend")}
            </D.DropdownMenuItem>
          )}

          {isInactive ? (
            <D.DropdownMenuItem
              onSelect={() =>
                void changeMemberStatus(
                  member.id,
                  AssociationMemberStatus.Active,
                )
              }
            >
              <L.UserCheck className="h-4 w-4" />
              {t("associationDashboard.members.actions.reactivate")}
            </D.DropdownMenuItem>
          ) : (
            <ConfirmDialog
              isLoading={isMutating}
              title={t("associationDashboard.members.confirm.deactivateTitle")}
              cancelText={t("associationDashboard.members.confirm.cancel")}
              confirmVariant="destructive"
              confirmText={t(
                "associationDashboard.members.confirm.deactivateConfirm",
              )}
              description={t(
                "associationDashboard.members.confirm.deactivateBody",
                { name: member.fullName ?? member.email ?? "" },
              )}
              onConfirm={() =>
                changeMemberStatus(member.id, AssociationMemberStatus.Inactive)
              }
              trigger={
                <D.DropdownMenuItem
                  variant="destructive"
                  onSelect={(event) => event.preventDefault()}
                >
                  <L.UserMinus className="h-4 w-4" />
                  {t("associationDashboard.members.actions.deactivate")}
                </D.DropdownMenuItem>
              }
            />
          )}
        </D.DropdownMenuContent>
      </D.DropdownMenu>
    );
  };

  if (isRefetching) {
    return (
      <div className="mt-6 space-y-3" aria-busy="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <caption className="sr-only">
            {t("associationDashboard.members.table.caption")}
          </caption>

          <thead className="text-xs uppercase text-muted-foreground">
            <tr className="border-b border-glass-border">
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
                className="border-b border-glass-border/70 transition-colors hover:bg-primary/5"
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
            className="rounded-3xl border border-glass-border bg-background/50 p-4"
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
