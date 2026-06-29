"use client";

import { useAdminOverviewTab } from "@/hooks/useAdminOverviewTab";
import { CHART_COLORS } from "@/utils/constant";
import { MetricCard } from "@modules/AdminDashboard/parts/admin-overview-metric-card";
import { formatDate } from "@/utils/function-helper";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as R from "recharts";
import * as L from "lucide-react";

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
          variant="glass"
          onClick={refreshAll}
          disabled={isLoading}
        >
          <L.RefreshCcw className="h-4 w-4" />
          {t("common.refresh")}
        </Button>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={L.Inbox}
          value={overview?.totalRequests ?? 0}
          title={t("adminDashboard.overview.cards.totalRequests")}
          description={t("adminDashboard.overview.cards.totalRequestsHint")}
        />

        <MetricCard
          icon={L.Clock3}
          value={overview?.pendingRequests ?? 0}
          title={t("adminDashboard.overview.cards.pendingRequests")}
          description={t("adminDashboard.overview.cards.pendingRequestsHint")}
        />

        <MetricCard
          icon={L.CheckCircle2}
          value={overview?.approvedRequests ?? 0}
          title={t("adminDashboard.overview.cards.approvedRequests")}
          description={t("adminDashboard.overview.cards.approvedRequestsHint")}
        />

        <MetricCard
          icon={L.XCircle}
          value={overview?.rejectedRequests ?? 0}
          title={t("adminDashboard.overview.cards.rejectedRequests")}
          description={t("adminDashboard.overview.cards.rejectedRequestsHint")}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <GlassCard>
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-medium">
                  {t("adminDashboard.overview.charts.requestTrend")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("adminDashboard.overview.charts.requestTrendHint")}
                </p>
              </div>
              <L.LineChart className="h-5 w-5 text-primary" />
            </div>

            <div className="mt-6 h-80">
              <R.ResponsiveContainer width="100%" height="100%">
                <R.AreaChart data={requestTrendData}>
                  <R.CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <R.XAxis dataKey="date" />
                  <R.YAxis allowDecimals={false} />
                  <R.Tooltip />
                  <R.Area
                    type="monotone"
                    dataKey="count"
                    fillOpacity={0.12}
                    fill="currentColor"
                    stroke="currentColor"
                  />
                </R.AreaChart>
              </R.ResponsiveContainer>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-medium">
                  {t("adminDashboard.overview.charts.statusDistribution")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("adminDashboard.overview.charts.statusDistributionHint")}
                </p>
              </div>
              <L.PieChart className="h-5 w-5 text-primary" />
            </div>

            <div className="mt-6 h-80">
              <R.ResponsiveContainer width="100%" height="100%">
                <R.BarChart data={statusChartData}>
                  <R.CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <R.XAxis dataKey="label" />
                  <R.YAxis allowDecimals={false} />
                  <R.Tooltip />
                  <R.Bar dataKey="count" radius={[14, 14, 0, 0]}>
                    {statusChartData.map((item, index) => (
                      <R.Cell
                        key={item.label}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </R.Bar>
                </R.BarChart>
              </R.ResponsiveContainer>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard>
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
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

            <div className="mt-5 divide-y divide-glass-border">
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
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
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

            <div className="mt-5 divide-y divide-glass-border">
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
