"use client";

import { AdminIngestionRejectDialog } from "@modules/AdminDashboard/parts/admin-ingestion-reject-dialog";
import { DashboardContentSkeleton } from "@layouts/parts/DashboardSkeleton";
import { TUseAdminIngestionTab } from "@hooks/useAdminIngestionTab";
import { IngestionItemState } from "@/lib/graphql/base";
import { ContentPagination } from "@elements/pagination";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Td, Th } from "@modules/AdminDashboard/parts/td-and-th-table";
import { Badge } from "@ui/badge";
import { Input } from "@ui/input";

import Link from "next/link";

import * as L from "lucide-react";

const COLUMN_COUNT = 6;

export const AdminIngestionReviewQueue = ({
  hook,
}: {
  hook: TUseAdminIngestionTab;
}) => {
  const {
    t,
    reviewQuery,
    reviewSourceId,
    setReviewSourceId,
    reviewState,
    setReviewState,
    reviewSearch,
    setReviewSearch,
    reviewPage,
    reviewNextPage,
    reviewPreviousPage,
    reviewCanPrevious,
    approve,
    isApproving,
    openReject,
    sourcesQuery,
  } = hook;

  const items = reviewQuery.data?.items ?? [];
  const sources = sourcesQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_200px]">
          <div className="relative">
            <L.Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={reviewSearch}
              className="h-12 rounded-md pl-10"
              onChange={(event) => setReviewSearch(event.target.value)}
              placeholder={t(
                "adminDashboard.ingestion.review.searchPlaceholder",
              )}
            />
          </div>

          <select
            value={reviewSourceId}
            aria-label={t("adminDashboard.ingestion.review.filters.source")}
            onChange={(event) => setReviewSourceId(event.target.value)}
            className="h-12 rounded-md border border-border bg-background px-4 text-sm"
          >
            <option value="ALL">
              {t("adminDashboard.ingestion.review.filters.allSources")}
            </option>
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.slug}
              </option>
            ))}
          </select>

          <select
            value={reviewState}
            aria-label={t("adminDashboard.ingestion.review.filters.state")}
            onChange={(event) =>
              setReviewState(event.target.value as IngestionItemState)
            }
            className="h-12 rounded-md border border-border bg-background px-4 text-sm"
          >
            <option value={IngestionItemState.Pending}>PENDING</option>
            <option value={IngestionItemState.Accepted}>ACCEPTED</option>
            <option value={IngestionItemState.Rejected}>REJECTED</option>
            <option value={IngestionItemState.Stale}>STALE</option>
          </select>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden p-0">
        {reviewQuery.isLoading ? (
          <div className="p-6">
            <DashboardContentSkeleton />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead className="border-b border-border bg-muted/40 text-left">
                <tr>
                  <Th>{t("adminDashboard.ingestion.review.table.title")}</Th>
                  <Th>{t("adminDashboard.ingestion.review.table.source")}</Th>
                  <Th>
                    {t("adminDashboard.ingestion.review.table.externalId")}
                  </Th>
                  <Th>
                    {t("adminDashboard.ingestion.review.table.firstSeen")}
                  </Th>
                  <Th>{t("adminDashboard.ingestion.review.table.state")}</Th>
                  <Th>{t("adminDashboard.ingestion.review.table.actions")}</Th>
                </tr>
              </thead>
              <tbody>
                {reviewQuery.isError ? (
                  <tr>
                    <td
                      colSpan={COLUMN_COUNT}
                      className="p-10 text-center text-destructive"
                    >
                      {t("adminDashboard.ingestion.review.error")}
                    </td>
                  </tr>
                ) : items.length ? (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-border/70 transition-colors hover:bg-primary/5"
                    >
                      <Td>
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
                            className="block text-xs text-muted-foreground hover:underline"
                          >
                            {item.canonicalUrl}
                          </a>
                        )}
                      </Td>
                      <Td>
                        <code className="text-xs">{item.sourceSlug}</code>
                      </Td>
                      <Td>
                        <code className="text-xs">{item.externalId}</code>
                      </Td>
                      <Td>{item.firstSeenAt}</Td>
                      <Td>
                        <Badge variant="secondary" className="rounded-full">
                          {item.state}
                        </Badge>
                        {item.rejectionReason && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.rejectionReason}
                          </p>
                        )}
                      </Td>
                      <Td>
                        <div className="flex gap-2">
                          <Button
                            radius="xl"
                            size="sm"
                            type="button"
                            disabled={
                              isApproving ||
                              item.state === IngestionItemState.Accepted
                            }
                            onClick={() => approve(item.id)}
                          >
                            <L.Check className="h-4 w-4" />
                            {t("adminDashboard.ingestion.review.approve")}
                          </Button>
                          <Button
                            radius="xl"
                            size="sm"
                            type="button"
                            variant="outline"
                            disabled={
                              item.state === IngestionItemState.Rejected
                            }
                            onClick={() => openReject(item.id)}
                          >
                            <L.X className="h-4 w-4" />
                            {t("adminDashboard.ingestion.review.reject")}
                          </Button>
                        </div>
                      </Td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={COLUMN_COUNT} className="p-10 text-center">
                      <L.ListChecks className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                      <p className="font-medium">
                        {t("adminDashboard.ingestion.review.empty")}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {!reviewQuery.isError && !reviewQuery.isLoading && (
        <ContentPagination
          page={reviewPage}
          onNext={reviewNextPage}
          isLoading={reviewQuery.isFetching}
          totalCount={reviewQuery.data?.totalCount ?? 0}
          onPrevious={reviewPreviousPage}
          canPrevious={reviewCanPrevious}
          hasNextPage={reviewQuery.data?.pageInfo?.hasNextPage ?? false}
        />
      )}

      <AdminIngestionRejectDialog hook={hook} />
    </div>
  );
};
