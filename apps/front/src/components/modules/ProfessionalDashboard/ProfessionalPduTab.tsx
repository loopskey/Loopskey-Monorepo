"use client";

import { useProfessionalPduReport } from "@/hooks/useProfessionalPDuReport";
import { ContentPagination } from "@elements/pagination";
import { MonthlyPduChart } from "@modules/ProfessionalDashboard/parts/monthly-pdu-chart";
import { ActivityForm } from "@modules/ProfessionalDashboard/parts/activity-form";
import { TargetForm } from "@modules/ProfessionalDashboard/parts/target-form";
import { MetricCard } from "@modules/ProfessionalDashboard/parts/metric-card";
import { GlassCard } from "@elements/glass-card";
import { Progress } from "@ui/progress";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { Input } from "@ui/input";

import * as GQL from "@/lib/graphql/generated";
import * as L from "lucide-react";
import * as D from "@ui/dialog";

const ProfessionalPduReportTab = () => {
  const {
    t,
    year,
    page,
    search,
    report,
    refetch,
    pageInfo,
    exportCsv,
    isLoading,
    activities,
    isFetching,
    handleNext,
    totalTarget,
    categoryRows,
    activitiesData,
    handlePrevious,
    isSavingTarget,
    isLogDialogOpen,
    handleYearChange,
    isCreatingActivity,
    handleSearchChange,
    isTargetDialogOpen,
    handleTargetSubmit,
    setIsLogDialogOpen,
    isActivitiesLoading,
    isActivitiesFetching,
    handleActivitySubmit,
    setIsTargetDialogOpen,
  } = useProfessionalPduReport();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("professionalDashboard.pduReport.eyebrow")}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t("professionalDashboard.pduReport.title")}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t("professionalDashboard.pduReport.subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Input
            value={year}
            type="number"
            onChange={handleYearChange}
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
            {t("professionalDashboard.pduReport.exportCsv")}
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
              label={t("professionalDashboard.pduReport.cards.totalPdus")}
              helper={t("professionalDashboard.pduReport.cards.thisYear")}
            />

            <MetricCard
              icon={L.Target}
              helper={`${year}`}
              value={totalTarget.toFixed(1)}
              label={t("professionalDashboard.pduReport.cards.target")}
            />

            <MetricCard
              icon={L.TrendingUp}
              value={`${Number(report?.progressToGoal ?? 0).toFixed(0)}%`}
              helper={t("professionalDashboard.pduReport.cards.goalProgress")}
              label={t("professionalDashboard.pduReport.cards.progressToGoal")}
            />

            <MetricCard
              icon={L.CalendarDays}
              value={Number(report?.averagePerMonth ?? 0).toFixed(1)}
              label={t("professionalDashboard.pduReport.cards.averagePerMonth")}
              helper={`${report?.activities ?? 0} ${t(
                "professionalDashboard.pduReport.cards.activities",
              )}`}
            />
          </div>

          <GlassCard>
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-xl font-medium">
                  {t("professionalDashboard.pduReport.quickActions.title")}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {t("professionalDashboard.pduReport.quickActions.subtitle")}
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
                      {t(
                        "professionalDashboard.pduReport.quickActions.adjustTargets",
                      )}
                    </Button>
                  </D.DialogTrigger>

                  <D.DialogContent className="glass-panel max-w-2xl rounded-3xl border-glass-border">
                    <D.DialogHeader>
                      <D.DialogTitle>
                        {t(
                          "professionalDashboard.pduReport.targetsDialog.title",
                        )}
                      </D.DialogTitle>

                      <D.DialogDescription>
                        {t(
                          "professionalDashboard.pduReport.targetsDialog.description",
                        )}
                      </D.DialogDescription>
                    </D.DialogHeader>

                    <TargetForm
                      year={year}
                      isLoading={isSavingTarget}
                      onSubmit={handleTargetSubmit}
                    />
                  </D.DialogContent>
                </D.Dialog>

                <D.Dialog
                  open={isLogDialogOpen}
                  onOpenChange={setIsLogDialogOpen}
                >
                  <D.DialogTrigger asChild>
                    <Button radius="xl" variant="brand">
                      <L.FilePlus2 className="h-4 w-4" />
                      {t(
                        "professionalDashboard.pduReport.quickActions.logActivity",
                      )}
                    </Button>
                  </D.DialogTrigger>

                  <D.DialogContent className="glass-panel max-w-2xl rounded-3xl border-glass-border">
                    <D.DialogHeader>
                      <D.DialogTitle>
                        {t(
                          "professionalDashboard.pduReport.activityDialog.title",
                        )}
                      </D.DialogTitle>

                      <D.DialogDescription>
                        {t(
                          "professionalDashboard.pduReport.activityDialog.description",
                        )}
                      </D.DialogDescription>
                    </D.DialogHeader>

                    <ActivityForm
                      isLoading={isCreatingActivity}
                      onSubmit={handleActivitySubmit}
                    />
                  </D.DialogContent>
                </D.Dialog>
              </div>
            </div>
          </GlassCard>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <GlassCard>
              <div className="mb-6">
                <h2 className="text-xl font-medium">
                  {t("professionalDashboard.pduReport.byCategory.title")}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {t("professionalDashboard.pduReport.byCategory.subtitle")}
                </p>
              </div>

              <div className="space-y-4">
                {categoryRows.map((item) => (
                  <div
                    key={item.category}
                    className="rounded-[1.5rem] border border-glass-border bg-background/40 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{item.category}</p>
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
            </GlassCard>

            <GlassCard>
              <div className="mb-6">
                <h2 className="text-xl font-medium">
                  {t("professionalDashboard.pduReport.overTime.title")}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {t("professionalDashboard.pduReport.overTime.subtitle")}
                </p>
              </div>
              <MonthlyPduChart activities={activities} />
            </GlassCard>
          </div>

          <GlassCard>
            <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-xl font-medium">
                  {t("professionalDashboard.pduReport.activities.title")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("professionalDashboard.pduReport.activities.subtitle")}
                </p>
              </div>
              <Input
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder={t(
                  "professionalDashboard.pduReport.activities.search",
                )}
                className="h-12 rounded-2xl bg-background/60 lg:max-w-sm"
              />
            </div>

            {isActivitiesLoading ? (
              <div className="flex min-h-72 items-center justify-center">
                <L.Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : activities.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-glass-border bg-background/40 p-10 text-center">
                <h3 className="text-xl font-medium">
                  {t("professionalDashboard.pduReport.activities.emptyTitle")}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  {t(
                    "professionalDashboard.pduReport.activities.emptyDescription",
                  )}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[2rem] border border-glass-border">
                <div className="hidden grid-cols-[1.4fr_0.75fr_0.75fr_0.75fr_0.5fr] gap-4 border-b border-glass-border bg-primary/5 px-5 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground lg:grid">
                  <span>
                    {t(
                      "professionalDashboard.pduReport.activities.table.activity",
                    )}
                  </span>
                  <span>
                    {t("professionalDashboard.pduReport.activities.table.date")}
                  </span>
                  <span>
                    {t(
                      "professionalDashboard.pduReport.activities.table.category",
                    )}
                  </span>
                  <span>
                    {t(
                      "professionalDashboard.pduReport.activities.table.status",
                    )}
                  </span>
                  <span className="text-right">
                    {t("professionalDashboard.pduReport.activities.table.pdus")}
                  </span>
                </div>
                <div className="divide-y divide-glass-border">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="grid gap-4 bg-background/35 px-5 py-5 transition-colors hover:bg-primary/5 lg:grid-cols-[1.4fr_0.75fr_0.75fr_0.75fr_0.5fr] lg:items-center"
                    >
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {activity.source}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                      <Badge variant="secondary">{activity.category}</Badge>
                      <Badge
                        variant={
                          activity.status === GQL.PduStatus.Approved
                            ? "default"
                            : "secondary"
                        }
                      >
                        {activity.status}
                      </Badge>

                      <p className="text-left font-medium lg:text-right">
                        {Number(activity.pdus ?? 0).toFixed(1)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
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

export default ProfessionalPduReportTab;
