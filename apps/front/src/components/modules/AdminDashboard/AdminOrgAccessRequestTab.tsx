"use client";

import { AdminAccessRequestReviewView } from "@modules/AdminDashboard/parts/admin-request-review";
import { useAdminAccessRequestsTab } from "@/hooks/useAdminAccessRequestsTab";
import { ContentPagination } from "@elements/pagination";
import { StatusBadge } from "@modules/AdminDashboard/parts/admin-status-badge";
import { formatDate } from "@/utils/function-helper";
import { GlassCard } from "@elements/glass-card";
import { StatCard } from "@modules/AdminDashboard/parts/admin-stat-card";
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
    stats,
    search,
    status,
    refresh,
    nextPage,
    setSearch,
    isLoading,
    setStatus,
    totalCount,
    canPrevious,
    hasNextPage,
    previousPage,
    resetFilters,
    statusOptions,
    selectedRequest,
    hasActiveFilters,
    openRequestReview,
  } = hook;

  if (selectedRequest) return <AdminAccessRequestReviewView hook={hook} />;

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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={L.Building2}
          value={stats.total}
          label={t("adminDashboard.accessRequests.stats.total")}
        />

        <StatCard
          icon={L.Eye}
          value={stats.pending}
          label={t("adminDashboard.accessRequests.stats.pending")}
        />

        <StatCard
          icon={L.CheckCircle2}
          value={stats.approved}
          label={t("adminDashboard.accessRequests.stats.approved")}
        />

        <StatCard
          icon={L.XCircle}
          value={stats.rejected}
          label={t("adminDashboard.accessRequests.stats.rejected")}
        />
      </section>

      <GlassCard>
        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
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
                <Th>{t("adminDashboard.accessRequests.table.actions")}</Th>
              </tr>
            </thead>

            <tbody>
              {items.length ? (
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
                    colSpan={6}
                    className="p-10 text-center text-muted-foreground"
                  >
                    {t("adminDashboard.accessRequests.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <ContentPagination
        page={page}
        onNext={nextPage}
        isLoading={isLoading}
        totalCount={totalCount}
        onPrevious={previousPage}
        canPrevious={canPrevious}
        hasNextPage={hasNextPage}
      />
    </div>
  );
};

export default AdminAccessRequestsTab;
