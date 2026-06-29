"use client";

import { ProviderDashboardRange } from "@/lib/graphql/generated";
import { useProviderOverviewTab } from "@/hooks/useProviderOverviewTab";
import { DashboardStatCard } from "@modules/ProfessionalDashboard/parts/dashboard-stat-card";
import { CHART_COLORS } from "@/utils/constant";
import { QuickAction } from "@modules/ProviderDashboard/parts/provider-quick-action";
import { formatDate } from "@/utils/function-helper";
import { MiniMetric } from "@modules/ProviderDashboard/parts/provider-mini-metric";
import { SummaryRow } from "@modules/ProviderDashboard/parts/provider-summary-row";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";
import { TipCard } from "./parts/provider-tip-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import Link from "next/link";

import * as L from "lucide-react";
import * as R from "recharts";

const rangeItems = [
  ProviderDashboardRange.Last_7Days,
  ProviderDashboardRange.Last_30Days,
  ProviderDashboardRange.Last_90Days,
  ProviderDashboardRange.ThisYear,
];

const ProviderOverviewTab = () => {
  const { t } = useI18n();

  const {
    range,
    overview,
    topEvents,
    setRange,
    isLoading,
    refreshAll,
    upcomingEvents,
    performanceChartData,
  } = useProviderOverviewTab();

  const statusBreakdown = overview?.statusBreakdown;

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("providerDashboard.overview.eyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t("providerDashboard.overview.title", {
              name: overview?.providerName ?? "Provider",
            })}
          </h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            {t("providerDashboard.overview.description")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            radius="xl"
            type="button"
            variant="glass"
            disabled={isLoading}
            onClick={refreshAll}
          >
            <L.RefreshCcw className="h-4 w-4" />
            {t("common.refresh")}
          </Button>

          <Button asChild radius="xl" variant="glass">
            <Link href="/dashboard/provider?tab=my-events">
              {t("providerDashboard.overview.viewAllEvents")}
            </Link>
          </Button>

          <Button asChild radius="xl" variant="brand">
            <Link href="/dashboard/provider?tab=create-event">
              <L.FilePlus2 className="h-4 w-4" />
              {t("providerDashboard.overview.createEvent")}
            </Link>
          </Button>
        </div>
      </section>

      <GlassCard>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-lg font-medium">
              {t("providerDashboard.overview.range.title")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("providerDashboard.overview.range.description")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {rangeItems.map((item) => (
              <Button
                key={item}
                radius="xl"
                type="button"
                onClick={() => setRange(item)}
                variant={range === item ? "brand" : "glass"}
              >
                {t(`providerDashboard.ranges.${item}`)}
              </Button>
            ))}
          </div>
        </div>
      </GlassCard>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          icon={L.CalendarDays}
          value={overview?.totalEvents ?? 0}
          title={t("providerDashboard.overview.cards.totalEvents")}
        />

        <DashboardStatCard
          icon={L.Users}
          value={overview?.totalRegistrations ?? 0}
          title={t("providerDashboard.overview.cards.totalRegistrations")}
        />

        <DashboardStatCard
          icon={L.Eye}
          value={overview?.totalViews ?? 0}
          title={t("providerDashboard.overview.cards.totalViews")}
        />

        <DashboardStatCard
          icon={L.Activity}
          value={`${overview?.conversionRate ?? 0}%`}
          title={t("providerDashboard.overview.cards.conversionRate")}
        />
      </section>
      <section className="grid gap-4 xl:grid-cols-3">
        <GlassCard className="xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">
                {t("providerDashboard.overview.performance.title")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("providerDashboard.overview.performance.description")}
              </p>
            </div>
            <L.BarChart3 className="h-5 w-5 text-primary" />
          </div>

          <div className="mt-6 h-80 w-full min-w-0">
            {performanceChartData.length > 0 ? (
              <R.ResponsiveContainer width="100%" height="100%">
                <R.AreaChart
                  data={performanceChartData}
                  margin={{
                    top: 12,
                    right: 20,
                    left: 0,
                    bottom: 8,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="registrationsGradient"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopOpacity={0.35}
                        stopColor="var(--primary)"
                      />
                      <stop
                        offset="95%"
                        stopOpacity={0.04}
                        stopColor="var(--primary)"
                      />
                    </linearGradient>
                  </defs>
                  <R.CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <R.XAxis
                    fontSize={12}
                    dataKey="date"
                    minTickGap={18}
                    tickLine={false}
                    axisLine={false}
                  />
                  <R.YAxis
                    width={36}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    domain={[0, "dataMax + 5"]}
                  />
                  <R.Tooltip />
                  <R.Area
                    type="monotone"
                    strokeWidth={3}
                    dataKey="registrations"
                    stroke="var(--primary)"
                    isAnimationActive={false}
                    fill="url(#registrationsGradient)"
                    dot={{ r: 4, fill: "var(--primary)", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "var(--primary)", strokeWidth: 0 }}
                    name={t(
                      "providerDashboard.overview.cards.totalRegistrations",
                    )}
                  />
                </R.AreaChart>
              </R.ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-glass-border text-sm text-muted-foreground">
                {t("providerDashboard.overview.performance.empty")}
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-medium">
            {t("providerDashboard.overview.summary.title")}
          </h2>

          <div className="mt-5 space-y-3">
            <SummaryRow
              className="bg-emerald-500/10"
              value={statusBreakdown?.published ?? 0}
              label={t("providerDashboard.overview.summary.published")}
            />
            <SummaryRow
              className="bg-amber-500/10"
              value={statusBreakdown?.draft ?? 0}
              label={t("providerDashboard.overview.summary.draft")}
            />
            <SummaryRow
              className="bg-muted/60"
              value={statusBreakdown?.archived ?? 0}
              label={t("providerDashboard.overview.summary.archived")}
            />
            <SummaryRow
              className="bg-destructive/10"
              value={statusBreakdown?.cancelled ?? 0}
              label={t("providerDashboard.overview.summary.cancelled")}
            />
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <GlassCard className="xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">
                {t("providerDashboard.overview.upcoming.title")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("providerDashboard.overview.upcoming.description")}
              </p>
            </div>
            <Button asChild size="sm" radius="xl" variant="glass">
              <Link href="/dashboard/provider?tab=my-events">
                {t("providerDashboard.overview.viewAllEvents")}
              </Link>
            </Button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {upcomingEvents.length ? (
              upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-3xl border border-glass-border bg-background/45 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-1 font-medium">{event.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDate(event.startDate)}
                      </p>
                    </div>
                    <Badge className="rounded-full">{event.status}</Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <MiniMetric label="PDU" value={event.pdu} />
                    <MiniMetric
                      value={event.views}
                      label={t("providerDashboard.overview.table.views")}
                    />
                    <MiniMetric
                      value={event.registrants}
                      label={t("providerDashboard.overview.table.registrants")}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-glass-border p-6 text-sm text-muted-foreground md:col-span-2">
                {t("providerDashboard.overview.upcoming.empty")}
              </div>
            )}
          </div>
        </GlassCard>
        <GlassCard>
          <h2 className="text-lg font-medium">
            {t("providerDashboard.overview.quickActions.title")}
          </h2>
          <div className="mt-5 space-y-3">
            <QuickAction
              icon={L.FilePlus2}
              href="/dashboard/provider?tab=create-event"
              title={t("providerDashboard.overview.quickActions.createEvent")}
            />

            <QuickAction
              icon={L.TicketCheck}
              href="/dashboard/provider?tab=attendees"
              title={t("providerDashboard.overview.quickActions.viewAttendees")}
            />

            <QuickAction
              icon={L.BarChart3}
              href="/dashboard/provider?tab=analytics"
              title={t("providerDashboard.overview.quickActions.analytics")}
            />
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <GlassCard className="xl:col-span-2">
          <h2 className="text-lg font-medium">
            {t("providerDashboard.overview.topEvents.title")}
          </h2>
          <div className="mt-6 h-80">
            <R.ResponsiveContainer width="100%" height="100%">
              <R.BarChart data={topEvents.slice(0, 6)}>
                <R.CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <R.XAxis dataKey="title" fontSize={11} />
                <R.YAxis fontSize={12} />
                <R.Tooltip />
                <R.Bar dataKey="registrations" radius={[12, 12, 0, 0]}>
                  {topEvents.slice(0, 6).map((_, index) => (
                    <R.Cell
                      key={index}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </R.Bar>
              </R.BarChart>
            </R.ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-medium">
            {t("providerDashboard.overview.tips.title")}
          </h2>
          <div className="mt-5 space-y-3">
            <TipCard
              icon={L.Lightbulb}
              title={t("providerDashboard.overview.tips.boostTitle")}
              description={t(
                "providerDashboard.overview.tips.boostDescription",
              )}
            />

            <TipCard
              icon={L.Megaphone}
              title={t("providerDashboard.overview.tips.promoteTitle")}
              description={t(
                "providerDashboard.overview.tips.promoteDescription",
              )}
            />
          </div>
        </GlassCard>
      </section>
    </div>
  );
};

export default ProviderOverviewTab;
