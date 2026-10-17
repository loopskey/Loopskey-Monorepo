"use client";

import { IngestionItemState, IngestionReviewReason } from "@/lib/graphql/base";
import { AdminIngestionBulkApproveDialog } from "@modules/AdminDashboard/parts/admin-ingestion-bulk-approve-dialog";
import { AdminIngestionRejectDialog } from "@modules/AdminDashboard/parts/admin-ingestion-reject-dialog";
import { TUseAdminIngestionTab } from "@hooks/useAdminIngestionTab";
import { DataTableFilters } from "@elements/data-table/data-table-filters";
import { ChartStatus } from "@elements/charts/chart-status";
import { formatDate } from "@/utils/function-helper";
import { DataTable } from "@elements/data-table/data-table";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import Link from "next/link";

import * as L from "lucide-react";

const REVIEW = "adminDashboard.ingestion.review";
const ALL = "ALL";

const HELD = "HELD";

const RECOMMENDATION_REASONS: IngestionReviewReason[] = [
  IngestionReviewReason.MissingDescription,
];

const REVIEW_STATES = [
  IngestionItemState.Pending,
  IngestionItemState.Accepted,
  IngestionItemState.Rejected,
  IngestionItemState.Stale,
];

export const AdminIngestionReviewQueue = ({
  hook,
}: {
  hook: TUseAdminIngestionTab;
}) => {
  const {
    t,
    approve,
    reviewPage,
    openReject,
    reviewQuery,
    reviewState,
    isApproving,
    sourcesQuery,
    bulkProgress,
    reviewSearch,
    reviewHeld,
    setReviewHeld,
    setReviewState,
    reviewNextPage,
    reviewSourceId,
    setReviewSearch,
    selectedItemIds,
    setReviewSourceId,
    reviewPreviousPage,
    toggleItemSelection,
    toggleAllSelectable,
    openBulkApproveQueue,
    openBulkApproveSelection,
  } = hook;

  const items = reviewQuery.data?.items ?? [];
  const sources = sourcesQuery.data?.items ?? [];
  const pendingTotal = reviewQuery.data?.totalCount ?? 0;
  const canApproveQueue =
    reviewState === IngestionItemState.Pending && pendingTotal > 0;
  const bulkBusy = isApproving || bulkProgress !== null;

  return (
    <div className="space-y-6">
      <GlassCard>
        <DataTable
          rows={items}
          rowKey={(item) => item.id}
          rowLabel={(item) => item.catalog?.title ?? item.externalId}
          isLoading={reviewQuery.isLoading}
          isFetching={reviewQuery.isFetching}
          caption={t("adminDashboard.ingestion.tabs.review")}
          isFiltered={Boolean(reviewSearch) || reviewSourceId !== ALL}
          error={
            reviewQuery.isError
              ? {
                  icon: L.CircleAlert,
                  title: t(`${REVIEW}.error`),
                  action: (
                    <Button
                      radius="lg"
                      type="button"
                      variant="outline"
                      onClick={() => void reviewQuery.refetch()}
                    >
                      <L.RefreshCcw aria-hidden />
                      {t("common.refresh")}
                    </Button>
                  ),
                }
              : null
          }
          empty={{ icon: L.ListChecks, title: t(`${REVIEW}.empty`) }}
          selection={{
            isDisabled: bulkBusy,
            selectedKeys: selectedItemIds,
            onToggle: toggleItemSelection,
            onToggleAll: toggleAllSelectable,
            label: t(`${REVIEW}.bulk.selectRow`),
            allLabel: t(`${REVIEW}.bulk.selectAll`),
            isSelectable: (item) => item.state !== IngestionItemState.Accepted,
          }}
          pagination={{
            kind: "cursor",
            page: reviewPage,
            onNext: reviewNextPage,
            onPrevious: reviewPreviousPage,
            total: reviewQuery.data?.totalCount ?? 0,
            hasNextPage: reviewQuery.data?.pageInfo?.hasNextPage ?? false,
          }}
          toolbar={
            <DataTableFilters
              onReset={() => {
                setReviewSearch("");
                setReviewSourceId(ALL);
                setReviewState(IngestionItemState.Pending);
              }}
              actions={
                selectedItemIds.length > 0 || canApproveQueue ? (
                  <>
                    {selectedItemIds.length > 0 && (
                      <Button
                        radius="lg"
                        type="button"
                        disabled={bulkBusy}
                        onClick={openBulkApproveSelection}
                      >
                        <L.CheckCheck aria-hidden />
                        {t(`${REVIEW}.bulk.approveSelected`, {
                          count: selectedItemIds.length,
                        })}
                      </Button>
                    )}
                    {canApproveQueue && (
                      <Button
                        radius="lg"
                        type="button"
                        variant="outline"
                        disabled={bulkBusy}
                        onClick={openBulkApproveQueue}
                      >
                        <L.ListChecks aria-hidden />
                        {t(`${REVIEW}.bulk.approveAll`, {
                          count: pendingTotal,
                        })}
                      </Button>
                    )}
                  </>
                ) : null
              }
              search={{
                value: reviewSearch,
                onChange: setReviewSearch,
                label: t(`${REVIEW}.searchPlaceholder`),
                placeholder: t(`${REVIEW}.searchPlaceholder`),
              }}
              filters={[
                {
                  type: "select",
                  id: "source",
                  value: reviewSourceId,
                  defaultValue: ALL,
                  onChange: setReviewSourceId,
                  label: t(`${REVIEW}.filters.source`),
                  options: [
                    { value: ALL, label: t(`${REVIEW}.filters.allSources`) },
                    ...sources.map((source) => ({
                      value: source.id,
                      label: source.slug,
                    })),
                  ],
                },
                {
                  type: "select",
                  id: "state",
                  value: reviewState,
                  defaultValue: IngestionItemState.Pending,
                  label: t(`${REVIEW}.filters.state`),
                  onChange: (value) =>
                    setReviewState(
                      REVIEW_STATES.find((state) => state === value) ??
                        IngestionItemState.Pending,
                    ),
                  options: REVIEW_STATES.map((state) => ({
                    value: state,
                    label: state,
                  })),
                },
                {
                  type: "select",
                  id: "held",
                  value: reviewHeld ? HELD : ALL,
                  defaultValue: ALL,
                  label: t(`${REVIEW}.filters.review`),
                  onChange: (value) => setReviewHeld(value === HELD),
                  options: [
                    { value: ALL, label: t(`${REVIEW}.filters.allItems`) },
                    { value: HELD, label: t(`${REVIEW}.filters.heldOnly`) },
                  ],
                },
              ]}
            />
          }
          columns={[
            {
              id: "title",
              mobile: "title",
              className: "max-w-md whitespace-normal",
              header: t(`${REVIEW}.table.title`),
              cell: (item) => (
                <span className="block min-w-0">
                  {item.catalog ? (
                    <Link
                      target="_blank"
                      className="font-medium text-primary hover:underline"
                      href={
                        item.catalog.slug
                          ? `/courses/${item.catalog.slug}`
                          : "#"
                      }
                    >
                      {item.catalog.title}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                  {item.canonicalUrl && (
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={item.canonicalUrl}
                      className="block truncate text-xs font-normal text-muted-foreground hover:underline"
                    >
                      {item.canonicalUrl}
                    </a>
                  )}
                </span>
              ),
            },
            {
              id: "state",
              mobile: "badge",
              header: t(`${REVIEW}.table.state`),
              cell: (item) => (
                <span className="block">
                  <Badge variant="secondary">{item.state}</Badge>
                  {item.rejectionReason && (
                    <span className="mt-1 block max-w-48 whitespace-normal text-xs text-muted-foreground">
                      {item.rejectionReason}
                    </span>
                  )}
                  {item.reviewReasons.length > 0 && (
                    <span className="mt-1.5 flex max-w-56 flex-wrap gap-1">
                      {item.reviewReasons.map((reason) => (
                        <ChartStatus
                          key={reason}
                          tone={
                            RECOMMENDATION_REASONS.includes(reason)
                              ? "info"
                              : "warning"
                          }
                          className="h-auto min-h-6 whitespace-normal py-0.5"
                        >
                          {t(`${REVIEW}.reasons.${reason}`)}
                        </ChartStatus>
                      ))}
                    </span>
                  )}
                </span>
              ),
            },
            {
              id: "source",
              header: t(`${REVIEW}.table.source`),
              cell: (item) => (
                <code className="text-xs">{item.sourceSlug}</code>
              ),
            },
            {
              id: "externalId",
              header: t(`${REVIEW}.table.externalId`),
              cell: (item) => (
                <code className="text-xs">{item.externalId}</code>
              ),
            },
            {
              id: "firstSeen",
              header: t(`${REVIEW}.table.firstSeen`),
              cell: (item) => formatDate(item.firstSeenAt),
            },
          ]}
          rowActions={(item) => [
            {
              id: "approve",
              icon: L.Check,
              label: t(`${REVIEW}.approve`),
              onSelect: () => approve(item.id),
              isDisabled:
                bulkBusy || item.state === IngestionItemState.Accepted,
            },
            {
              id: "reject",
              icon: L.X,
              label: t(`${REVIEW}.reject`),
              onSelect: () => openReject(item.id),
              isDisabled: item.state === IngestionItemState.Rejected,
            },
          ]}
        />
      </GlassCard>

      <AdminIngestionRejectDialog hook={hook} />
      <AdminIngestionBulkApproveDialog hook={hook} />
    </div>
  );
};
