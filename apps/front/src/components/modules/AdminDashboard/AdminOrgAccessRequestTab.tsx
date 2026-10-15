"use client";

import { getAdminAccessRequestListState } from "@/utils/admin-access-request-state";
import { AdminAccessRequestReviewView } from "@modules/AdminDashboard/parts/admin-request-review";
import { useAdminAccessRequestsTab } from "@/hooks/useAdminAccessRequestsTab";
import { DataTableFilters } from "@elements/data-table/data-table-filters";
import { StatusBadge } from "@modules/AdminDashboard/parts/admin-status-badge";
import { formatDate } from "@/utils/function-helper";
import { DataTable } from "@elements/data-table/data-table";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import * as L from "lucide-react";

const REQUESTS = "adminDashboard.accessRequests";

const AdminAccessRequestsTab = () => {
  const hook = useAdminAccessRequestsTab();

  const {
    t,
    page,
    items,
    query,
    search,
    status,
    refresh,
    nextPage,
    setSearch,
    isLoading,
    setStatus,
    totalCount,
    hasNextPage,
    previousPage,
    resetFilters,
    statusOptions,
    sortDirection,
    setSortDirection,
    hasActiveFilters,
    selectedRequestId,
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
            variant="outline"
            disabled={isLoading}
            onClick={() => refresh()}
          >
            <L.RefreshCcw className="h-4 w-4" />
            {t("common.refresh")}
          </Button>
        </div>
      </section>

      <GlassCard>
        <DataTable
          rows={items}
          rowKey={(item) => item.id}
          isFiltered={hasActiveFilters}
          isFetching={query.isFetching}
          onRowClick={openRequestReview}
          caption={t(`${REQUESTS}.title`)}
          isLoading={listState === "loading"}
          rowLabel={(item) => item.organizationName}
          sort={{ id: "createdAt", direction: sortDirection }}
          onSortChange={(next) => setSortDirection(next.direction)}
          error={
            listState === "error" || listState === "unauthorized"
              ? {
                  icon:
                    listState === "unauthorized"
                      ? L.ShieldAlert
                      : L.CircleAlert,
                  title:
                    listState === "unauthorized"
                      ? t(`${REQUESTS}.unauthorized`)
                      : t(`${REQUESTS}.error`),
                  action:
                    listState === "error" ? (
                      <Button
                        radius="lg"
                        type="button"
                        variant="outline"
                        onClick={() => refresh()}
                      >
                        <L.RefreshCcw aria-hidden />
                        {t("common.refresh")}
                      </Button>
                    ) : undefined,
                }
              : null
          }
          empty={{ icon: L.Inbox, title: t(`${REQUESTS}.empty`) }}
          filteredEmpty={{
            icon: L.SearchX,
            title: t(`${REQUESTS}.noResults`),
            action: (
              <Button
                radius="lg"
                type="button"
                variant="outline"
                onClick={resetFilters}
              >
                <L.FilterX aria-hidden />
                {t("common.reset")}
              </Button>
            ),
          }}
          pagination={{
            kind: "cursor",
            page,
            hasNextPage,
            onNext: nextPage,
            total: totalCount,
            onPrevious: previousPage,
          }}
          toolbar={
            <DataTableFilters
              isFiltered={hasActiveFilters}
              onReset={resetFilters}
              search={{
                value: search,
                onChange: setSearch,
                label: t(`${REQUESTS}.filters.search`),
                placeholder: t(`${REQUESTS}.filters.search`),
              }}
              filters={[
                {
                  type: "select",
                  id: "status",
                  value: status,
                  defaultValue: "ALL",
                  label: t(`${REQUESTS}.filters.status`),
                  onChange: (value) =>
                    setStatus(
                      statusOptions.find((option) => option === value) ?? "ALL",
                    ),
                  options: statusOptions.map((option) => ({
                    value: option,
                    label: t(`${REQUESTS}.status.${option}`),
                  })),
                },
              ]}
            />
          }
          columns={[
            {
              id: "organization",
              mobile: "title",
              header: t(`${REQUESTS}.table.organization`),
              cell: (item) => (
                <span className="block">
                  <span className="block font-medium">
                    {item.organizationName}
                  </span>
                  <span className="block text-xs font-normal text-muted-foreground">
                    {item.representativeFullName}
                  </span>
                </span>
              ),
            },
            {
              id: "status",
              mobile: "badge",
              header: t(`${REQUESTS}.table.status`),
              cell: (item) => <StatusBadge status={item.status} />,
            },
            {
              id: "workEmail",
              mobile: "wide",
              header: t(`${REQUESTS}.table.workEmail`),
              cell: (item) => item.workEmail,
            },
            {
              id: "type",
              header: t(`${REQUESTS}.table.type`),
              cell: (item) => item.organizationType,
            },
            {
              id: "createdAt",
              isSortable: true,
              header: t(`${REQUESTS}.table.createdAt`),
              cell: (item) => formatDate(item.createdAt),
            },
            {
              id: "reviewedAt",
              header: t(`${REQUESTS}.table.reviewedAt`),
              cell: (item) =>
                item.reviewedAt ? formatDate(item.reviewedAt) : "—",
            },
            {
              id: "reviewer",
              header: t(`${REQUESTS}.table.reviewer`),
              cell: (item) => item.reviewedByName ?? "—",
            },
          ]}
          rowActions={(item) => [
            {
              id: "review",
              icon: L.Eye,
              label: t(`${REQUESTS}.actions.review`),
              onSelect: () => openRequestReview(item),
            },
          ]}
        />
      </GlassCard>
    </div>
  );
};

export default AdminAccessRequestsTab;
