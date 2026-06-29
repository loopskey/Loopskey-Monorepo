"use client";

import { formatCurrency, rangeOptions } from "@/utils/function-helper";
import { useProviderAnalyticsTab } from "@/hooks/useProviderAnalyticsTab";
import { ProviderDashboardRange } from "@/lib/graphql/generated";
import { DashboardStatCard } from "@modules/ProfessionalDashboard/parts/dashboard-stat-card";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import * as C from "@modules/ProviderDashboard/parts/provider-analytics-charts";
import * as L from "lucide-react";
import * as S from "@ui/select";

const ProviderAnalyticsTab = () => {
  const {
    t,
    range,
    setRange,
    analytics,
    isFetching,
    refreshAll,
    downloadCsv,
    pdusByCategory,
    eventTypeBreakdown,
    topPerformingEvents,
    registrationsOverTime,
  } = useProviderAnalyticsTab();

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("providerDashboard.analytics.eyebrow")}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t("providerDashboard.analytics.title")}
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            {t("providerDashboard.analytics.description")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <S.Select
            value={range}
            onValueChange={(value) => setRange(value as ProviderDashboardRange)}
          >
            <S.SelectTrigger className="h-11 w-44 rounded-2xl">
              <S.SelectValue />
            </S.SelectTrigger>

            <S.SelectContent>
              {rangeOptions.map((item) => (
                <S.SelectItem key={item} value={item}>
                  {t(`providerDashboard.analytics.ranges.${item}`)}
                </S.SelectItem>
              ))}
            </S.SelectContent>
          </S.Select>

          <Button
            type="button"
            radius="xl"
            variant="glass"
            disabled={isFetching}
            onClick={refreshAll}
          >
            <L.RefreshCcw className="h-4 w-4" />
            {t("common.refresh")}
          </Button>
          <Button
            type="button"
            radius="xl"
            variant="brand"
            onClick={downloadCsv}
          >
            <L.Download className="h-4 w-4" />
            {t("providerDashboard.analytics.exportCsv")}
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          icon={L.Wallet}
          title={t("providerDashboard.analytics.cards.totalRevenue")}
          value={formatCurrency(analytics?.totalRevenue)}
          description={t(
            "providerDashboard.analytics.cards.totalRevenueDescription",
          )}
        />

        <DashboardStatCard
          icon={L.Users}
          title={t("providerDashboard.analytics.cards.avgFee")}
          value={formatCurrency(analytics?.avgFeePerAttendee)}
          description={t("providerDashboard.analytics.cards.avgFeeDescription")}
        />

        <DashboardStatCard
          icon={L.TrendingUp}
          title={t("providerDashboard.analytics.cards.conversionRate")}
          value={`${analytics?.conversionRate ?? 0}%`}
          description={t(
            "providerDashboard.analytics.cards.conversionRateDescription",
          )}
        />

        <DashboardStatCard
          icon={L.Star}
          title={t("providerDashboard.analytics.cards.avgRating")}
          value={analytics?.avgRating ?? 0}
          description={t(
            "providerDashboard.analytics.cards.avgRatingDescription",
          )}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <GlassCard className="xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">
                {t("providerDashboard.analytics.charts.registrationsOverTime")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(
                  "providerDashboard.analytics.charts.registrationsOverTimeDescription",
                )}
              </p>
            </div>
            <L.BarChart3 className="h-5 w-5 text-primary" />
          </div>

          <div className="mt-6 h-80">
            <C.ProviderRegistrationsOverTimeChart
              data={registrationsOverTime}
            />
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-medium">
            {t("providerDashboard.analytics.charts.eventTypeBreakdown")}
          </h2>

          <div className="mt-6 h-80">
            <C.ProviderEventTypePieChart data={eventTypeBreakdown} />
          </div>
        </GlassCard>
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        <GlassCard>
          <h2 className="text-lg font-medium">
            {t("providerDashboard.analytics.charts.pdusByCategory")}
          </h2>

          <div className="mt-6 h-80">
            <C.ProviderBreakdownBarChart data={pdusByCategory} />
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-medium">
            {t("providerDashboard.analytics.charts.topPerforming")}
          </h2>

          <div className="mt-6 h-80">
            <C.ProviderTopPerformingChart data={topPerformingEvents} />
          </div>
        </GlassCard>
      </section>

      <GlassCard>
        <h2 className="text-lg font-medium">
          {t("providerDashboard.analytics.topEventsTable.title")}
        </h2>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-glass-border text-left text-muted-foreground">
                <th className="py-3">
                  {t("providerDashboard.analytics.topEventsTable.event")}
                </th>
                <th className="py-3">
                  {t(
                    "providerDashboard.analytics.topEventsTable.registrations",
                  )}
                </th>
                <th className="py-3">
                  {t("providerDashboard.analytics.topEventsTable.views")}
                </th>
                <th className="py-3">
                  {t("providerDashboard.analytics.topEventsTable.revenue")}
                </th>
                <th className="py-3">
                  {t("providerDashboard.analytics.topEventsTable.conversion")}
                </th>
              </tr>
            </thead>

            <tbody>
              {topPerformingEvents.length ? (
                topPerformingEvents.map((event) => (
                  <tr key={event.eventId} className="border-b border-border/50">
                    <td className="py-4 font-bold">{event.title}</td>
                    <td className="py-4">{event.registrations}</td>
                    <td className="py-4">{event.views}</td>
                    <td className="py-4">{formatCurrency(event.revenue)}</td>
                    <td className="py-4">{event.conversionRate}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-muted-foreground"
                  >
                    {t("providerDashboard.analytics.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default ProviderAnalyticsTab;
