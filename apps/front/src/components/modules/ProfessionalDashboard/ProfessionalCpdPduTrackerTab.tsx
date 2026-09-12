"use client";

import { useProfessionalCpdPduTracker } from "@/hooks/useProfessionalCpdPduTracker";
import { ActivitiesFilters } from "@modules/ProfessionalDashboard/parts/activities-filters";
import { ContentPagination } from "@elements/pagination";
import { ActivitiesTable } from "@modules/ProfessionalDashboard/parts/activities-table";
import { MetricCard } from "@modules/ProfessionalDashboard/parts/metric-card";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";

import * as L from "lucide-react";

const TRACKER = "professionalDashboard.cpdPduTracker";

const ProfessionalCpdPduTrackerTab = () => {
  const {
    t,
    page,
    filters,
    summary,
    pageInfo,
    isFiltered,
    activities,
    handleNext,
    yearOptions,
    handleRefresh,
    isRefreshing,
    activitiesData,
    handlePrevious,
    isSummaryError,
    isSummaryLoading,
    handleAddActivity,
    handleViewActivity,
    handleFilterChange,
    handleResetFilters,
    handleEditActivity,
    deletingActivityId,
    isDeletingActivity,
    isActivitiesLoading,
    handleDeleteActivity,
    activityTypeOptions,
    isActivitiesFetching,
    handleDownloadEvidence,
  } = useProfessionalCpdPduTracker();

  const summaryValue = (value: number | undefined) => {
    if (isSummaryError) return "—";
    return String(value ?? 0);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page title and primary actions */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-medium text-primary">
            {t(`${TRACKER}.eyebrow`)}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t(`${TRACKER}.title`)}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t(`${TRACKER}.subtitle`)}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            radius="xl"
            type="button"
            variant="outline"
            disabled={isRefreshing}
            onClick={handleRefresh}
          >
            {isRefreshing ? (
              <L.Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <L.RefreshCw className="h-4 w-4" />
            )}
            {t("professionalDashboard.common.refresh")}
          </Button>

          <Button
            radius="xl"
            type="button"
            onClick={handleAddActivity}
          >
            <L.FilePlus2 className="h-4 w-4" />
            {t(`${TRACKER}.quickActions.addActivity`)}
          </Button>
        </div>
      </div>

      {/* 2. Summary cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {isSummaryLoading ? (
          <>
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </>
        ) : (
          <>
            <MetricCard
              icon={L.CircleCheckBig}
              label={t(`${TRACKER}.summary.completedTitle`)}
              helper={t(`${TRACKER}.summary.completedHelper`)}
              value={summaryValue(summary?.completedActivities)}
            />

            <MetricCard
              icon={L.Paperclip}
              label={t(`${TRACKER}.summary.evidenceTitle`)}
              value={summaryValue(summary?.activitiesWithEvidence)}
              helper={t(`${TRACKER}.summary.evidenceHelper`, {
                files: isSummaryError
                  ? "—"
                  : (summary?.evidenceFilesCount ?? 0),
              })}
            />
          </>
        )}
      </div>

      {/* 3. Search and filter toolbar + 4. Activities table */}
      <GlassCard>
        <div className="mb-6 space-y-5">
          <div>
            <h2 className="text-xl font-medium">
              {t(`${TRACKER}.activities.title`)}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(`${TRACKER}.activities.subtitle`)}
            </p>
          </div>

          <ActivitiesFilters
            t={t}
            filters={filters}
            isFiltered={isFiltered}
            yearOptions={yearOptions}
            onReset={handleResetFilters}
            onChange={handleFilterChange}
            isLoading={isActivitiesFetching}
            activityTypeOptions={activityTypeOptions}
          />
        </div>

        {isActivitiesLoading ? (
          <div className="flex min-h-72 items-center justify-center">
            <L.Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : activities.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            <h3 className="text-xl font-medium">
              {isFiltered
                ? t(`${TRACKER}.activities.noMatchTitle`)
                : t(`${TRACKER}.activities.emptyTitle`)}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {isFiltered
                ? t(`${TRACKER}.activities.noMatchDescription`)
                : t(`${TRACKER}.activities.emptyDescription`)}
            </p>

            {isFiltered ? (
              <Button
                radius="xl"
                type="button"
                variant="outline"
                className="mt-5"
                onClick={handleResetFilters}
              >
                <L.FilterX className="h-4 w-4" />
                {t(`${TRACKER}.filters.clear`)}
              </Button>
            ) : (
              <Button
                radius="xl"
                type="button"
                className="mt-5"
                onClick={handleAddActivity}
              >
                <L.FilePlus2 className="h-4 w-4" />
                {t(`${TRACKER}.quickActions.addActivity`)}
              </Button>
            )}
          </div>
        ) : (
          <ActivitiesTable
            t={t}
            activities={activities}
            onView={handleViewActivity}
            onEdit={handleEditActivity}
            isDeleting={isDeletingActivity}
            onDelete={handleDeleteActivity}
            onDownload={handleDownloadEvidence}
            deletingActivityId={deletingActivityId}
          />
        )}

        <ContentPagination
          page={page}
          className="mt-6"
          onNext={handleNext}
          canPrevious={page > 1}
          onPrevious={handlePrevious}
          isLoading={isActivitiesFetching}
          totalCount={activitiesData?.totalCount}
          hasNextPage={Boolean(pageInfo?.hasNextPage)}
        />
      </GlassCard>
    </div>
  );
};

export default ProfessionalCpdPduTrackerTab;
