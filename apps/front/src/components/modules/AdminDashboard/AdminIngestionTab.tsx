"use client";

import { AdminIngestionSourceCreateDialog } from "@modules/AdminDashboard/parts/admin-ingestion-source-create-dialog";
import { AdminIngestionSourceDetail } from "@modules/AdminDashboard/parts/admin-ingestion-source-detail";
import { AdminIngestionSourcesTable } from "@modules/AdminDashboard/parts/admin-ingestion-sources-table";
import { AdminIngestionReviewQueue } from "@modules/AdminDashboard/parts/admin-ingestion-review-queue";
import { useAdminIngestionTab } from "@hooks/useAdminIngestionTab";
import { ContentPagination } from "@elements/pagination";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { cn } from "@/lib/utils";

import * as L from "lucide-react";

const AdminIngestionTab = () => {
  const hook = useAdminIngestionTab();

  const {
    t,
    view,
    setView,
    selectedSourceId,
  } = hook;

  if (selectedSourceId) return <AdminIngestionSourceDetail hook={hook} />;

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("adminDashboard.ingestion.eyebrow")}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t("adminDashboard.ingestion.title")}
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            {t("adminDashboard.ingestion.description")}
          </p>
        </div>

        <div
          role="tablist"
          aria-label={t("adminDashboard.ingestion.viewSwitchLabel")}
          className="flex w-fit gap-1 rounded-full border p-1"
        >
          <Button
            radius="full"
            type="button"
            role="tab"
            aria-selected={view === "sources"}
            variant={view === "sources" ? "default" : "ghost"}
            onClick={() => setView("sources")}
          >
            <L.Database className="h-4 w-4" />
            {t("adminDashboard.ingestion.tabs.sources")}
          </Button>

          <Button
            radius="full"
            type="button"
            role="tab"
            aria-selected={view === "review"}
            variant={view === "review" ? "default" : "ghost"}
            onClick={() => setView("review")}
          >
            <L.ListChecks className="h-4 w-4" />
            {t("adminDashboard.ingestion.tabs.review")}
          </Button>
        </div>
      </section>

      {view === "sources" ? <SourcesView hook={hook} /> : null}
      {view === "review" ? <AdminIngestionReviewQueue hook={hook} /> : null}

      <AdminIngestionSourceCreateDialog hook={hook} />
    </div>
  );
};

const SourcesView = ({
  hook,
}: {
  hook: ReturnType<typeof useAdminIngestionTab>;
}) => {
  const {
    t,
    sourcesQuery,
    sourceSearch,
    setSourceSearch,
    sourceKind,
    setSourceKind,
    sourceActive,
    setSourceActive,
    sourceHasActiveFilters,
    resetSourceFilters,
    sourcePage,
    sourceNextPage,
    sourcePreviousPage,
    sourceCanPrevious,
    openCreate,
  } = hook;

  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="grid gap-4 lg:grid-cols-[1fr_200px_200px_auto]">
          <div className="relative">
            <L.Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={sourceSearch}
              className="h-12 rounded-md pl-10"
              onChange={(event) => setSourceSearch(event.target.value)}
              placeholder={t("adminDashboard.ingestion.sources.searchPlaceholder")}
            />
          </div>

          <select
            value={sourceKind}
            aria-label={t("adminDashboard.ingestion.sources.filters.kind")}
            onChange={(event) => setSourceKind(event.target.value as typeof sourceKind)}
            className="h-12 rounded-md border border-border bg-background px-4 text-sm"
          >
            <option value="ALL">
              {t("adminDashboard.ingestion.sources.filters.allKinds")}
            </option>
            <option value="COURSE">COURSE</option>
            <option value="EVENT">EVENT</option>
            <option value="PODCAST">PODCAST</option>
            <option value="YOUTUBE">YOUTUBE</option>
          </select>

          <select
            value={sourceActive}
            aria-label={t("adminDashboard.ingestion.sources.filters.status")}
            onChange={(event) =>
              setSourceActive(event.target.value as typeof sourceActive)
            }
            className="h-12 rounded-md border border-border bg-background px-4 text-sm"
          >
            <option value="ALL">
              {t("adminDashboard.ingestion.sources.filters.allStatuses")}
            </option>
            <option value="ACTIVE">
              {t("adminDashboard.ingestion.sources.filters.active")}
            </option>
            <option value="INACTIVE">
              {t("adminDashboard.ingestion.sources.filters.inactive")}
            </option>
          </select>

          <div className="flex gap-2">
            <Button
              radius="xl"
              type="button"
              variant="outline"
              disabled={!sourceHasActiveFilters}
              onClick={resetSourceFilters}
              className={cn(!sourceHasActiveFilters && "opacity-60")}
            >
              <L.RotateCcw className="h-4 w-4" />
              {t("common.reset")}
            </Button>

            <Button radius="xl" type="button" onClick={openCreate}>
              <L.Plus className="h-4 w-4" />
              {t("adminDashboard.ingestion.sources.create.action")}
            </Button>
          </div>
        </div>
      </GlassCard>

      <AdminIngestionSourcesTable hook={hook} />

      {!sourcesQuery.isError && !sourcesQuery.isLoading && (
        <ContentPagination
          page={sourcePage}
          onNext={sourceNextPage}
          isLoading={sourcesQuery.isFetching}
          totalCount={sourcesQuery.data?.totalCount ?? 0}
          onPrevious={sourcePreviousPage}
          canPrevious={sourceCanPrevious}
          hasNextPage={sourcesQuery.data?.pageInfo?.hasNextPage ?? false}
        />
      )}
    </div>
  );
};

export default AdminIngestionTab;
