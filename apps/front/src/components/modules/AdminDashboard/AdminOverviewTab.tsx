"use client";

import { ShareBar, ShareLegend } from "@elements/charts/share-bar";
import { useAdminOverviewTab } from "@/hooks/useAdminOverviewTab";
import { LazyTrendChart } from "@elements/charts/lazy-trend-chart";
import { StatCardGrid } from "@elements/stat-card/stat-card-grid";
import { CHART_COLOR } from "@/utils/chart.util";
import { formatDate } from "@/utils/function-helper";
import { ChartCard } from "@elements/charts/chart-frame";
import { GlassCard } from "@elements/glass-card";
import { StatCard } from "@elements/stat-card/stat-card";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

const STATUS_COLORS = {
  pending: CHART_COLOR.warning,
  approved: CHART_COLOR.good,
  rejected: CHART_COLOR.critical,
} as const;

const AdminOverviewTab = () => {
  const { t } = useI18n();
  const {
    overview,
    isLoading,
    refreshAll,
    recentUsers,
    statusChartData,
    recentAuditLogs,
    requestTrendData,
  } = useAdminOverviewTab();

  const count = (value: number) => value.toLocaleString();
  const percent = (value: number) => `${Math.round(value)}%`;
  const statusSegments = statusChartData.map((item) => ({
    id: item.key,
    value: item.count,
    color: STATUS_COLORS[item.key],
    label: t(`adminDashboard.overview.charts.statuses.${item.key}`),
  }));

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("adminDashboard.overview.eyebrow")}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t("adminDashboard.overview.title")}
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            {t("adminDashboard.overview.description")}
          </p>
        </div>

        <Button
          radius="xl"
          type="button"
          variant="outline"
          onClick={refreshAll}
          disabled={isLoading}
        >
          <L.RefreshCcw className="h-4 w-4" />
          {t("common.refresh")}
        </Button>
      </section>

      <StatCardGrid>
        <StatCard
          isLoading={!overview && isLoading}
          icon={L.Inbox}
          value={overview?.totalRequests ?? 0}
          title={t("adminDashboard.overview.cards.totalRequests")}
          description={t("adminDashboard.overview.cards.totalRequestsHint")}
        />

        <StatCard
          icon={L.Clock3}
          isLoading={!overview && isLoading}
          value={overview?.pendingRequests ?? 0}
          title={t("adminDashboard.overview.cards.pendingRequests")}
          description={t("adminDashboard.overview.cards.pendingRequestsHint")}
        />

        <StatCard
          icon={L.CheckCircle2}
          isLoading={!overview && isLoading}
          value={overview?.approvedRequests ?? 0}
          title={t("adminDashboard.overview.cards.approvedRequests")}
          description={t("adminDashboard.overview.cards.approvedRequestsHint")}
        />

        <StatCard
          icon={L.XCircle}
          isLoading={!overview && isLoading}
          value={overview?.rejectedRequests ?? 0}
          title={t("adminDashboard.overview.cards.rejectedRequests")}
          description={t("adminDashboard.overview.cards.rejectedRequestsHint")}
        />
      </StatCardGrid>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard
          headingLevel="h2"
          isLoading={!overview && isLoading}
          isEmpty={requestTrendData.length === 0}
          title={t("adminDashboard.overview.charts.requestTrend")}
          description={t("adminDashboard.overview.charts.requestTrendHint")}
          table={{
            caption: t("adminDashboard.overview.charts.requestTrend"),
            columns: [
              t("adminDashboard.overview.charts.date"),
              t("adminDashboard.overview.charts.requests"),
            ],
            rows: requestTrendData.map((point) => ({
              id: point.date,
              cells: [formatDate(point.date) ?? point.date, count(point.count)],
            })),
          }}
        >
          <LazyTrendChart
            xKey="date"
            data={requestTrendData}
            formatValue={count}
            formatX={(value) => formatDate(value) ?? value}
            label={t("adminDashboard.overview.charts.requestTrend")}
            series={[
              {
                key: "count",
                variant: "area",
                color: CHART_COLOR.series1,
                label: t("adminDashboard.overview.charts.requests"),
              },
            ]}
          />
        </ChartCard>

        <ChartCard
          headingLevel="h2"
          isLoading={!overview && isLoading}
          isEmpty={statusSegments.every((segment) => segment.value === 0)}
          title={t("adminDashboard.overview.charts.statusDistribution")}
          description={t(
            "adminDashboard.overview.charts.statusDistributionHint",
          )}
          table={{
            caption: t("adminDashboard.overview.charts.statusDistribution"),
            columns: [
              t("adminDashboard.overview.charts.status"),
              t("adminDashboard.overview.charts.requests"),
            ],
            rows: statusSegments.map((segment) => ({
              id: segment.id,
              cells: [segment.label, count(segment.value)],
            })),
          }}
        >
          <div className="grid gap-4">
            <ShareBar
              formatValue={count}
              formatShare={percent}
              segments={statusSegments}
              shareName={t("chart.share")}
              unitName={t("adminDashboard.overview.charts.requests")}
              label={t("adminDashboard.overview.charts.statusDistribution")}
            />
            <ShareLegend
              formatValue={count}
              formatShare={percent}
              segments={statusSegments}
            />
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard>
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-primary/10 p-3 text-primary">
                <L.Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-medium">
                  {t("adminDashboard.overview.recentUsers.title")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("adminDashboard.overview.recentUsers.description")}
                </p>
              </div>
            </div>

            <div className="mt-5 divide-y divide-border">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div>
                    <p className="font-medium">{user.fullName ?? user.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.email ?? "-"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{user.role}</Badge>
                    <Badge>{user.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-primary/10 p-3 text-primary">
                <L.Activity className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-medium">
                  {t("adminDashboard.overview.audit.title")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("adminDashboard.overview.audit.description")}
                </p>
              </div>
            </div>

            <div className="mt-5 divide-y divide-border">
              {recentAuditLogs.map((log) => (
                <div key={log.id} className="py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{log.action}</p>
                    <Badge variant="secondary">
                      {log.entityType ??
                        t("adminDashboard.overview.audit.system")}
                    </Badge>
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {log.actorEmail ?? "-"} · {formatDate(log.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default AdminOverviewTab;
