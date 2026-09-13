"use client";

import { TAssociationAttentionDetailDialog } from "@/types/association-dashboard.types";
import { TAssociationAttentionMemberRow } from "@/types/association-dashboard.types";
import { AssociationAttentionSection } from "@/lib/graphql/base";
import { ASSOCIATION_BAND_VARIANTS } from "@utils/association-compliance-bands";
import { AssociationReportTable } from "@modules/AssociationDashboard/parts/association-report-table";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as API from "@lib/rtk/endpoints/association-dashboard.api";
import * as REPORTS from "@utils/association-reports";
import * as DIALOG from "@ui/dialog";
import * as L from "lucide-react";

import type { TReportColumn } from "@modules/AssociationDashboard/parts/association-report-table";

const PAGE_SIZE = 25;

type TRow = TAssociationAttentionMemberRow;

export const AssociationAttentionDetailDialog = ({
  hook,
}: TAssociationAttentionDetailDialog) => {
  const router = useRouter();
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

  const detailColumn = (): TReportColumn<TRow> => {
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

  const columns: TReportColumn<TRow>[] = [
    {
      id: "member",
      header: t("associationDashboard.reports.table.member"),
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">
            {row.fullName ?? row.email ?? none}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {row.groupTitle ?? none}
          </p>
        </div>
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

        <AssociationReportTable<TRow>
          page={page}
          pages={hasNextPage ? page + 1 : page}
          total={totalCount}
          sort=""
          direction="asc"
          rows={rows}
          columns={columns}
          isLoading={query.isLoading}
          caption={
            viewingSection ? label(`sections.${viewingSection}.title`) : ""
          }
          emptyLabel={label("detail.empty")}
          rowKey={(row) => row.memberId}
          sortLabel={() => ""}
          onSort={() => {}}
          onPage={(next) => {
            if (next > page) {
              const nextCursor = query.data?.pageInfo?.nextCursor;
              if (nextCursor)
                setCursorStack((current) => [...current, nextCursor]);
            } else {
              setCursorStack((current) => current.slice(0, -1));
            }
          }}
          onOpenRow={(row) =>
            router.push(
              `/dashboard/association?tab=members&memberId=${row.memberId}`,
            )
          }
          openLabel={() => label("detail.viewMember")}
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
