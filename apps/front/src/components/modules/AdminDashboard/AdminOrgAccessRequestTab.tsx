"use client";

import { AdminAccessRequestReviewView } from "@modules/AdminDashboard/parts/admin-request-review";
import { useAdminAccessRequestsTab } from "@/hooks/useAdminAccessRequestsTab";
import { ContentPagination } from "@elements/pagination";
import { StatusBadge } from "@modules/AdminDashboard/parts/admin-status-badge";
import { getAdminAccessRequestListState } from "@/utils/admin-access-request-state";
import { formatDate } from "@/utils/function-helper";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Td, Th } from "@modules/AdminDashboard/parts/td-and-th-table";
import { Input } from "@ui/input";

import * as L from "lucide-react";

const AdminAccessRequestsTab = () => {
  const hook = useAdminAccessRequestsTab();

  const {
    t,
    page,
    items,
    search,
    status,
    query,
    refresh,
    nextPage,
    setSearch,
    isLoading,
    setStatus,
    detailQuery,
    sortDirection,
    totalCount,
    canPrevious,
    hasNextPage,
    previousPage,
    resetFilters,
    statusOptions,
    selectedRequestId,
    setSortDirection,
    hasActiveFilters,
    openRequestReview,
  } = hook;

  if (selectedRequestId) return <AdminAccessRequestReviewView hook={hook} />;

  const errorStatus =
    query.error &&
    typeof query.error === "object" &&
    "status" in query.error &&
    typeof query.error.status === "number"
      ? query.error.status
      : null;
  const listState = getAdminAccessRequestListState({
    errorStatus,
    hasActiveFilters,
    isError: query.isError,
    isLoading: query.isLoading,
    itemCount: items.length,
  });
  const emptyMessage = hasActiveFilters
    ? t("adminDashboard.accessRequests.noResults")
    : t("adminDashboard.accessRequests.empty");

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("adminDashboard.accessRequests.eyebrow")}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t("adminDashboard.accessRequests.title")}
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            {t("adminDashboard.accessRequests.description")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            radius="xl"
            type="button"
            variant="glass"
            disabled={!hasActiveFilters || isLoading}
            onClick={resetFilters}
          >
            <L.RotateCcw className="h-4 w-4" />
            {t("common.reset")}
          </Button>

          <Button
            radius="xl"
            type="button"
            variant="glass"
            disabled={isLoading}
            onClick={() => refresh()}
          >
            <L.RefreshCcw className="h-4 w-4" />
            {t("common.refresh")}
          </Button>
        </div>
      </section>

      <GlassCard>
        <div className="grid gap-4 lg:grid-cols-[1fr_240px_240px]">
          <div className="relative">
            <L.Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              className="h-12 rounded-2xl pl-10"
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("adminDashboard.accessRequests.filters.search")}
            />
          </div>

          <select
            aria-label={t("adminDashboard.accessRequests.filters.status")}
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof status)}
            className="h-12 rounded-2xl border border-border bg-background px-4 text-sm"
          >
            {statusOptions.map((item) => (
              <option key={item} value={item}>
                {t(`adminDashboard.accessRequests.status.${item}`)}
              </option>
            ))}
          </select>

          <select
            value={sortDirection}
            aria-label={t("adminDashboard.accessRequests.filters.sort")}
            onChange={(event) =>
              setSortDirection(event.target.value as typeof sortDirection)
            }
            className="h-12 rounded-2xl border border-border bg-background px-4 text-sm"
          >
            <option value="desc">
              {t("adminDashboard.accessRequests.filters.newest")}
            </option>
            <option value="asc">
              {t("adminDashboard.accessRequests.filters.oldest")}
            </option>
          </select>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="border-b border-glass-border bg-muted/40 text-left">
              <tr>
                <Th>{t("adminDashboard.accessRequests.table.status")}</Th>
                <Th>{t("adminDashboard.accessRequests.table.organization")}</Th>
                <Th>{t("adminDashboard.accessRequests.table.workEmail")}</Th>
                <Th>{t("adminDashboard.accessRequests.table.type")}</Th>
                <Th>{t("adminDashboard.accessRequests.table.createdAt")}</Th>
                <Th>{t("adminDashboard.accessRequests.table.reviewedAt")}</Th>
                <Th>{t("adminDashboard.accessRequests.table.reviewer")}</Th>
                <Th>{t("adminDashboard.accessRequests.table.actions")}</Th>
              </tr>
            </thead>

            <tbody>
              {listState === "loading" ? (
                <tr>
                  <td
                    colSpan={8}
                    className="p-10 text-center text-muted-foreground"
                  >
                    <L.Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
                    {t("common.loading")}
                  </td>
                </tr>
              ) : listState === "error" || listState === "unauthorized" ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-destructive">
                    {listState === "unauthorized"
                      ? t("adminDashboard.accessRequests.unauthorized")
                      : t("adminDashboard.accessRequests.error")}
                  </td>
                </tr>
              ) : items.length ? (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-glass-border/70 transition-colors hover:bg-primary/5"
                  >
                    <Td>
                      <StatusBadge status={item.status} />
                    </Td>

                    <Td>
                      <div className="font-medium">{item.organizationName}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.representativeFullName}
                      </div>
                    </Td>

                    <Td>
                      <span className="inline-flex items-center gap-2">
                        <L.Mail className="h-4 w-4 text-primary" />
                        {item.workEmail}
                      </span>
                    </Td>

                    <Td>{item.organizationType}</Td>

                    <Td>{formatDate(item.createdAt)}</Td>

                    <Td>
                      {item.reviewedAt ? formatDate(item.reviewedAt) : "—"}
                    </Td>

                    <Td>{item.reviewedByName ?? "—"}</Td>

                    <Td>
                      <Button
                        radius="xl"
                        type="button"
                        variant="glass"
                        size="sm"
                        onClick={() => openRequestReview(item)}
                      >
                        <L.Eye className="h-4 w-4" />
                        {t("adminDashboard.accessRequests.actions.review")}
                      </Button>
                    </Td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="p-10 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {!query.isError && !query.isLoading && (
        <ContentPagination
          page={page}
          onNext={nextPage}
          isLoading={isLoading || detailQuery.isFetching}
          totalCount={totalCount}
          onPrevious={previousPage}
          canPrevious={canPrevious}
          hasNextPage={hasNextPage}
        />
      )}
    </div>
  );
};

export default AdminAccessRequestsTab;
