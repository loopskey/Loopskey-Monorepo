"use client";

import { OverviewProgressRow } from "@modules/OrgDashboard/parts/org-overview-progress-row";
import { useOrgOverviewTab } from "@hooks/useOrgOverviewTab";
import { OverviewStatCard } from "@modules/OrgDashboard/parts/org-overview-stat-card";
import { GlassCard } from "@elements/glass-card";
import { Progress } from "@ui/progress";
import { Button } from "@ui/button";

import * as L from "lucide-react";
import * as R from "recharts";

const OrgOverviewTab = () => {
  const {
    t,
    summary,
    refetch,
    isLoading,
    trendingTopics,
    attentionMembers,
    complianceChartData,
    hasComplianceChartData,
  } = useOrgOverviewTab();

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("organizationDashboard.overview.eyebrow")}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t("organizationDashboard.overview.title")}
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            {t("organizationDashboard.overview.description")}
          </p>
        </div>

        <Button
          radius="xl"
          variant="glass"
          disabled={isLoading}
          onClick={() => refetch()}
        >
          <L.RefreshCcw className="h-4 w-4" />
          {t("common.refresh")}
        </Button>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OverviewStatCard
          value={summary?.totalMembers ?? 0}
          icon={<L.Users className="h-5 w-5" />}
          hint={t("organizationDashboard.overview.stats.live")}
          title={t("organizationDashboard.overview.stats.totalMembers")}
        />

        <OverviewStatCard
          value={summary?.activeMembers ?? 0}
          icon={<L.UserCheck className="h-5 w-5" />}
          title={t("organizationDashboard.overview.stats.activeMembers")}
          hint={t("organizationDashboard.overview.stats.engagement", {
            value: Math.round(summary?.engagementRate ?? 0),
          })}
        />

        <OverviewStatCard
          icon={<L.Activity className="h-5 w-5" />}
          hint={t("organizationDashboard.overview.stats.average")}
          value={`${Math.round(summary?.averageCompliance ?? 0)}%`}
          title={t("organizationDashboard.overview.stats.cpdCompliance")}
        />

        <OverviewStatCard
          value={summary?.nonCompliantMembers ?? 0}
          icon={<L.TriangleAlert className="h-5 w-5" />}
          title={t("organizationDashboard.overview.stats.nonCompliant")}
          hint={t("organizationDashboard.overview.stats.needAttention")}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <GlassCard>
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-medium">
                  {t("organizationDashboard.overview.compliance.title")}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {t("organizationDashboard.overview.compliance.description")}
                </p>
              </div>

              <L.PieChart className="h-5 w-5 text-primary" />
            </div>

            <div className="mt-6">
              {hasComplianceChartData ? (
                <>
                  <div className="h-80 w-full">
                    <R.ResponsiveContainer width="100%" height="100%">
                      <R.BarChart
                        data={complianceChartData}
                        margin={{
                          top: 16,
                          right: 12,
                          left: -18,
                          bottom: 8,
                        }}
                      >
                        <R.CartesianGrid strokeDasharray="3 3" opacity={0.25} />

                        <R.XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          interval={0}
                          tick={{
                            fontSize: 12,
                            fill: "currentColor",
                          }}
                        />

                        <R.YAxis
                          allowDecimals={false}
                          tickLine={false}
                          axisLine={false}
                          tick={{
                            fontSize: 12,
                            fill: "currentColor",
                          }}
                        />

                        <R.Tooltip
                          cursor={{ opacity: 0.12 }}
                          formatter={(value, _name, props) => {
                            const payload = props.payload as {
                              percent?: number;
                            };

                            return [
                              `${value} members · ${payload.percent ?? 0}%`,
                              "Count",
                            ];
                          }}
                          labelFormatter={(label) => `${label}`}
                          contentStyle={{
                            borderRadius: "1rem",
                            border: "1px solid var(--glass-border)",
                            background: "var(--popover)",
                            color: "var(--popover-foreground)",
                            boxShadow:
                              "0 20px 60px oklch(0.18 0.08 255 / 0.18)",
                          }}
                        />

                        <R.Bar
                          dataKey="value"
                          radius={[14, 14, 0, 0]}
                          barSize={48}
                        >
                          {complianceChartData.map((item) => (
                            <R.Cell key={item.key} fill={item.color} />
                          ))}
                        </R.Bar>
                      </R.BarChart>
                    </R.ResponsiveContainer>
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-3">
                    {complianceChartData.map((item) => (
                      <div
                        key={item.key}
                        className="rounded-3xl border border-glass-border bg-background/45 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {item.label}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {item.meta}
                            </p>
                          </div>

                          <span
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>

                        <p className="mt-3 text-2xl font-semibold text-foreground">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="rounded-3xl bg-background/45 p-5 text-sm text-muted-foreground">
                  {t("organizationDashboard.overview.compliance.empty")}
                </p>
              )}
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="relative z-10">
            <h2 className="text-xl font-medium">
              {t("organizationDashboard.overview.attention.title")}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("organizationDashboard.overview.attention.description")}
            </p>

            <div className="mt-5 space-y-3">
              {attentionMembers.map((member) => (
                <div
                  key={member.id}
                  className="rounded-3xl border border-glass-border bg-background/45 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {member.fullName ?? member.email}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {member.departmentTitle ?? "-"}
                      </p>
                    </div>

                    <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
                      {Math.round(member.compliance)}%
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground">
                    {t("organizationDashboard.overview.attention.remaining", {
                      value: member.remainingPdus,
                    })}
                  </p>

                  <Progress value={member.compliance} className="mt-2" />
                </div>
              ))}

              {!attentionMembers.length && (
                <p className="rounded-3xl bg-background/45 p-5 text-sm text-muted-foreground">
                  {t("organizationDashboard.overview.attention.empty")}
                </p>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-medium">
                {t("organizationDashboard.overview.topics.title")}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {t("organizationDashboard.overview.topics.description")}
              </p>
            </div>

            <L.TrendingUp className="h-5 w-5 text-primary" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {trendingTopics.map((topic) => (
              <OverviewProgressRow
                key={topic.title}
                title={topic.title}
                value={topic.percentage}
                meta={t("organizationDashboard.overview.topics.count", {
                  value: topic.count,
                })}
              />
            ))}
          </div>

          {!trendingTopics.length && (
            <p className="mt-6 rounded-3xl bg-background/45 p-5 text-sm text-muted-foreground">
              {t("organizationDashboard.overview.topics.empty")}
            </p>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default OrgOverviewTab;
