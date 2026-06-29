"use client";

import { TOrgReportTrendChart } from "@/types/org-dashboard.types";
import { GlassCard } from "@elements/glass-card";

import * as R from "recharts";

export const OrgReportsTrendChart = ({ hook }: TOrgReportTrendChart) => {
  const { t, complianceTrendData, chartColors } = hook;

  return (
    <GlassCard className="xl:col-span-2">
      <div className="relative z-10">
        <h2 className="text-xl font-medium">
          {t("organizationDashboard.reports.charts.trend.title")}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {t("organizationDashboard.reports.charts.trend.description")}
        </p>

        <div className="mt-6 h-80">
          <R.ResponsiveContainer width="100%" height="100%">
            <R.LineChart data={complianceTrendData}>
              <R.CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <R.XAxis dataKey="label" />
              <R.YAxis />
              <R.Tooltip />
              <R.Line
                dot={{ r: 4 }}
                type="monotone"
                strokeWidth={3}
                dataKey="compliance"
                stroke={chartColors[0]}
              />
            </R.LineChart>
          </R.ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  );
};
