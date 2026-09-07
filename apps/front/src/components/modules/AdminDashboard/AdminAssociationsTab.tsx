"use client";

import { AdminAssociationCreateDialog } from "@modules/AdminDashboard/parts/admin-association-create-dialog";
import { useAdminAssociationsTab } from "@/hooks/useAdminAssociationsTab";
import { AdminAssociationsTable } from "@modules/AdminDashboard/parts/admin-associations-table";
import { ContentPagination } from "@elements/pagination";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Input } from "@ui/input";

import * as L from "lucide-react";

const AdminAssociationsTab = () => {
  const hook = useAdminAssociationsTab();

  const {
    t,
    page,
    query,
    search,
    refresh,
    nextPage,
    isLoading,
    setSearch,
    openCreate,
    totalCount,
    ownerStatus,
    canPrevious,
    hasNextPage,
    previousPage,
    resetFilters,
    setOwnerStatus,
    hasActiveFilters,
    ownerStatusOptions,
  } = hook;

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("adminDashboard.associations.eyebrow")}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t("adminDashboard.associations.title")}
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            {t("adminDashboard.associations.description")}
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

          <Button
            radius="xl"
            type="button"
            variant="brand"
            onClick={openCreate}
          >
            <L.Plus className="h-4 w-4" />
            {t("adminDashboard.associations.actions.create")}
          </Button>
        </div>
      </section>

      <GlassCard>
        <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
          <div className="relative">
            <L.Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              className="h-12 rounded-2xl pl-10"
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("adminDashboard.associations.filters.search")}
            />
          </div>

          <select
            value={ownerStatus}
            aria-label={t("adminDashboard.associations.filters.ownerStatus")}
            onChange={(event) =>
              setOwnerStatus(event.target.value as typeof ownerStatus)
            }
            className="h-12 rounded-2xl border border-border bg-background px-4 text-sm"
          >
            {ownerStatusOptions.map((option) => (
              <option key={option} value={option}>
                {t(`adminDashboard.associations.ownerStatus.${option}`)}
              </option>
            ))}
          </select>
        </div>
      </GlassCard>

      <AdminAssociationsTable hook={hook} />

      {!query.isError && !query.isLoading && (
        <ContentPagination
          page={page}
          onNext={nextPage}
          isLoading={isLoading}
          totalCount={totalCount}
          onPrevious={previousPage}
          canPrevious={canPrevious}
          hasNextPage={hasNextPage}
        />
      )}

      <AdminAssociationCreateDialog hook={hook} />
    </div>
  );
};

export default AdminAssociationsTab;
