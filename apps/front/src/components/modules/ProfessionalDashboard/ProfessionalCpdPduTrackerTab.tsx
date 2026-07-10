"use client";

import { useProfessionalCpdPduTracker } from "@/hooks/useProfessionalCpdPduTracker";
import { ActivitiesFilters } from "@modules/ProfessionalDashboard/parts/activities-filters";
import { ContentPagination } from "@elements/pagination";
import { PduOverTimeChart } from "@elements/dashboard-charts";
import { ActivitiesTable } from "@modules/ProfessionalDashboard/parts/activities-table";
import { TargetForm } from "@modules/ProfessionalDashboard/parts/target-form";
import { MetricCard } from "@modules/ProfessionalDashboard/parts/metric-card";
import { GlassCard } from "@elements/glass-card";
import { Progress } from "@ui/progress";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { Input } from "@ui/input";

import * as L from "lucide-react";
import * as D from "@ui/dialog";

const TRACKER = "professionalDashboard.cpdPduTracker";

const ProfessionalCpdPduTrackerTab = () => {
  const {
    t,
    year,
    page,
    report,
    filters,
    refetch,
    pageInfo,
    exportCsv,
    isLoading,
    isFiltered,
    activities,
    isFetching,
    handleNext,
    totalTarget,
    pduOverTime,
    hasChartData,
    categoryRows,
    activitiesData,
    handlePrevious,
    isSavingTarget,
    handleYearChange,
    handleAddActivity,
    handleTargetSubmit,
    handleFilterChange,
    handleResetFilters,
    isTargetDialogOpen,
    handleEditActivity,
    isDeletingActivity,
    isActivitiesLoading,
    handleDeleteActivity,
    isActivitiesFetching,
    setIsTargetDialogOpen,
    handleDownloadEvidence,
  } = useProfessionalCpdPduTracker();

  return (
    <div className="space-y-6">
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
          <Input
            value={year}
            type="number"
            onChange={handleYearChange}
            aria-label={t(`${TRACKER}.reportYear`)}
            className="h-11 w-32 rounded-2xl bg-background/60"
          />

          <Button
            radius="xl"
            type="button"
            variant="glass"
            disabled={isFetching}
            onClick={() => refetch()}
          >
            {isFetching ? (
              <L.Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <L.RefreshCw className="h-4 w-4" />
            )}

            {t("professionalDashboard.common.refresh")}
          </Button>

          <Button type="button" radius="xl" variant="glass" onClick={exportCsv}>
            <L.Download className="h-4 w-4" />
            {t(`${TRACKER}.exportCsv`)}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-96 items-center justify-center">
          <L.Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={L.BarChart3}
              value={Number(report?.totalPdus ?? 0).toFixed(1)}
              label={t(`${TRACKER}.cards.totalPdus`)}
              helper={t(`${TRACKER}.cards.thisYear`)}
            />

            <MetricCard
              icon={L.Target}
              helper={`${year}`}
              value={totalTarget.toFixed(1)}
              label={t(`${TRACKER}.cards.target`)}
            />

            <MetricCard
              icon={L.TrendingUp}
              value={`${Number(report?.progressToGoal ?? 0).toFixed(0)}%`}
              helper={t(`${TRACKER}.cards.goalProgress`)}
              label={t(`${TRACKER}.cards.progressToGoal`)}
            />

            <MetricCard
              icon={L.CalendarDays}
              value={Number(report?.averagePerMonth ?? 0).toFixed(1)}
              label={t(`${TRACKER}.cards.averagePerMonth`)}
              helper={`${report?.activities ?? 0} ${t(
                `${TRACKER}.cards.activities`,
              )}`}
            />
          </div>

          <GlassCard>
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-xl font-medium">
                  {t(`${TRACKER}.quickActions.title`)}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {t(`${TRACKER}.quickActions.subtitle`)}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <D.Dialog
                  open={isTargetDialogOpen}
                  onOpenChange={setIsTargetDialogOpen}
                >
                  <D.DialogTrigger asChild>
                    <Button radius="xl" variant="glass">
                      <L.Target className="h-4 w-4" />
                      {t(`${TRACKER}.quickActions.adjustTargets`)}
                    </Button>
                  </D.DialogTrigger>

                  <D.DialogContent className="glass-panel max-w-2xl rounded-3xl border-glass-border">
                    <D.DialogHeader>
                      <D.DialogTitle>
                        {t(`${TRACKER}.targetsDialog.title`)}
                      </D.DialogTitle>

                      <D.DialogDescription>
                        {t(`${TRACKER}.targetsDialog.description`)}
                      </D.DialogDescription>
                    </D.DialogHeader>

                    <TargetForm
                      year={year}
                      isLoading={isSavingTarget}
                      onSubmit={handleTargetSubmit}
                    />
                  </D.DialogContent>
                </D.Dialog>

                <Button
                  radius="xl"
                  variant="brand"
                  type="button"
                  onClick={handleAddActivity}
                >
                  <L.FilePlus2 className="h-4 w-4" />
                  {t(`${TRACKER}.quickActions.addActivity`)}
                </Button>
              </div>
            </div>
          </GlassCard>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <GlassCard>
              <div className="mb-6">
                <h2 className="text-xl font-medium">
                  {t(`${TRACKER}.byCategory.title`)}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {t(`${TRACKER}.byCategory.subtitle`)}
                </p>
              </div>

              {categoryRows.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-glass-border bg-background/40 p-10 text-center text-sm text-muted-foreground">
                  {t(`${TRACKER}.byCategory.empty`)}
                </div>
              ) : (
                <div className="space-y-4">
                  {categoryRows.map((item) => (
                    <div
                      key={item.category}
                      className="rounded-[1.5rem] border border-glass-border bg-background/40 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">
                            {t(`${TRACKER}.categories.${item.category}`)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.earned.toFixed(1)} / {item.target.toFixed(1)}{" "}
                            PDUs
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {item.progress.toFixed(0)}%
                        </Badge>
                      </div>

                      <Progress value={item.progress} className="h-2.5" />
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>

            <GlassCard>
              <div className="mb-6">
                <h2 className="text-xl font-medium">
                  {t(`${TRACKER}.overTime.title`)}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {t(`${TRACKER}.overTime.subtitle`)}
                </p>
              </div>

              {hasChartData ? (
                <div className="h-72">
                  <PduOverTimeChart data={pduOverTime} />
                </div>
              ) : (
                <div className="flex h-72 items-center justify-center rounded-[1.5rem] border border-dashed border-glass-border bg-background/40 p-10 text-center text-sm text-muted-foreground">
                  {t(`${TRACKER}.overTime.empty`)}
                </div>
              )}
            </GlassCard>
          </div>

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
                onChange={handleFilterChange}
                onReset={handleResetFilters}
              />
            </div>

            {isActivitiesLoading ? (
              <div className="flex min-h-72 items-center justify-center">
                <L.Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : activities.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-glass-border bg-background/40 p-10 text-center">
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
                    variant="glass"
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
                    variant="brand"
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
                onEdit={handleEditActivity}
                isDeleting={isDeletingActivity}
                onDelete={handleDeleteActivity}
                onDownload={handleDownloadEvidence}
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
        </>
      )}
    </div>
  );
};

export default ProfessionalCpdPduTrackerTab;
