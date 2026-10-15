"use client";

import { TAssociationAttentionDetailDialog } from "@/types/association-dashboard.types";
import { TAssociationAttentionMemberRow } from "@/types/association-dashboard.types";
import { AssociationAttentionSection } from "@/lib/graphql/base";
import { ASSOCIATION_BAND_VARIANTS } from "@utils/association-compliance-bands";
import { DataTable } from "@elements/data-table/data-table";
import { useState } from "react";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as REPORTS from "@utils/association-reports";
import * as DIALOG from "@ui/dialog";
import * as API from "@lib/rtk/endpoints/association-dashboard.api";
import * as L from "lucide-react";

import type { DataTableColumn } from "@/types/data-table.types";

const PAGE_SIZE = 25;

type TRow = TAssociationAttentionMemberRow;

export const AssociationAttentionDetailDialog = ({
  hook,
}: TAssociationAttentionDetailDialog) => {
  const { t, locale, viewingSection, closeDetails } = hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.messages.${key}`, vars);

  const none = t("associationDashboard.reports.table.none");

  const isThisDialog =
    viewingSection !== null &&
    viewingSection !== AssociationAttentionSection.CategoryBehind &&
    viewingSection !== AssociationAttentionSection.ReadyReports;

  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const cursor = cursorStack.at(-1) ?? null;

  const query = API.useAssociationAttentionMembersQuery(
    {
      section: viewingSection ?? AssociationAttentionSection.BelowThreshold,
      pagination: { take: PAGE_SIZE, cursor },
    },
    { skip: !isThisDialog },
  );

  const rows = query.data?.items ?? [];
  const totalCount = query.data?.totalCount ?? 0;
  const hasNextPage = query.data?.pageInfo?.hasNextPage ?? false;
  const page = cursorStack.length + 1;

  const close = () => {
    setCursorStack([]);
    closeDetails();
  };

  const detailColumn = (): DataTableColumn<TRow> => {
    if (viewingSection === AssociationAttentionSection.NewJoiners)
      return {
        id: "joined",
        header: label("detail.columnJoined"),
        cell: (row) => REPORTS.formatReportDate(row.detailDate, locale, none),
      };

    if (viewingSection === AssociationAttentionSection.ExpiringCertificates)
      return {
        id: "expiry",
        header: label("detail.columnCertificate"),
        cell: (row) => {
          if (!row.detailDate) return none;
          const isExpired = new Date(row.detailDate) <= new Date();
          const when = REPORTS.formatReportDate(row.detailDate, locale, none);
          return `${row.detail ?? none} · ${
            isExpired
              ? label("detail.expired", { when })
              : label("detail.expiring", { when })
          }`;
        },
      };

    return {
      id: "deadline",
      header: label("detail.columnDeadline"),
      cell: (row) =>
        `${row.detail ?? none} · ${REPORTS.formatReportDate(row.deadline, locale, none)}`,
    };
  };

  const columns: DataTableColumn<TRow>[] = [
    {
      id: "member",
      mobile: "title",
      className: "max-w-64",
      header: t("associationDashboard.reports.table.member"),
      cell: (row) => (
        <span className="block min-w-0">
          <span className="block truncate font-medium">
            {row.fullName ?? row.email ?? none}
          </span>
          <span className="block truncate text-xs font-normal text-muted-foreground">
            {row.groupTitle ?? none}
          </span>
        </span>
      ),
    },
    detailColumn(),
    ...(viewingSection === AssociationAttentionSection.BelowThreshold
      ? [
          {
            id: "band",
            header: t("associationDashboard.reports.table.band"),
            cell: (row: TRow) =>
              row.band ? (
                <Badge variant={ASSOCIATION_BAND_VARIANTS[row.band]}>
                  {t(`associationDashboard.reports.bands.${row.band}`)}
                </Badge>
              ) : (
                none
              ),
          },
        ]
      : []),
  ];

  return (
    <DIALOG.Dialog
      open={isThisDialog}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DIALOG.DialogContent className="glass-dialog max-h-[85vh] overflow-y-auto border-border sm:max-w-3xl">
        <DIALOG.DialogHeader>
          <DIALOG.DialogTitle>
            {viewingSection
              ? label("detail.title", {
                  title: label(`sections.${viewingSection}.title`),
                })
              : ""}
          </DIALOG.DialogTitle>
          <DIALOG.DialogDescription>
            {viewingSection
              ? label(`sections.${viewingSection}.description`)
              : ""}
          </DIALOG.DialogDescription>
        </DIALOG.DialogHeader>

        <DataTable
          rows={rows}
          columns={columns}
          isLoading={query.isLoading}
          isFetching={query.isFetching}
          rowKey={(row) => row.memberId}
          rowLabel={(row) => row.fullName ?? row.email ?? row.memberId}
          caption={
            viewingSection ? label(`sections.${viewingSection}.title`) : ""
          }
          empty={{ icon: L.UserCheck, title: label("detail.empty") }}
          pagination={{
            kind: "cursor",
            page,
            hasNextPage,
            total: totalCount,
            onNext: () => {
              const nextCursor = query.data?.pageInfo?.nextCursor;
              if (nextCursor)
                setCursorStack((current) => [...current, nextCursor]);
            },
            onPrevious: () => setCursorStack((current) => current.slice(0, -1)),
          }}
          rowActions={(row) => [
            {
              id: "open",
              icon: L.UserSearch,
              label: label("detail.viewMember"),
              href: `/dashboard/association?tab=members&memberId=${row.memberId}`,
            },
          ]}
        />

        <DIALOG.DialogFooter>
          <Button radius="xl" type="button" variant="outline" onClick={close}>
            <L.X className="h-4 w-4" />
            {label("detail.close")}
          </Button>
        </DIALOG.DialogFooter>
      </DIALOG.DialogContent>
    </DIALOG.Dialog>
  );
};
