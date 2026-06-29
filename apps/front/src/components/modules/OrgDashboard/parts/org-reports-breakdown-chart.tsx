"use client";

import { TOrgReportBreakdownChart } from "@/types/org-dashboard.types";
import { GlassCard } from "@elements/glass-card";

import * as R from "recharts";

export const OrgReportsBreakdownChart = ({
  hook,
}: TOrgReportBreakdownChart) => {
  const { t, departmentComplianceChartData, chartColors } = hook;

  return (
    <GlassCard>
      <div className="relative z-10">
        <h2 className="text-xl font-medium">
          {t("organizationDashboard.reports.charts.breakdown.title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("organizationDashboard.reports.charts.breakdown.description")}
        </p>
        <div className="mt-6 h-80">
          <R.ResponsiveContainer width="100%" height="100%">
            <R.BarChart data={departmentComplianceChartData}>
              <R.CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <R.XAxis
                interval={0}
                dataKey="departmentTitle"
                tick={{
                  fontSize: 12,
                }}
              />
              <R.YAxis />
              <R.Tooltip
                formatter={(value, name) => {
                  const formattedValue =
                    typeof value === "number" ? value.toFixed(2) : value;
                  return [formattedValue, name];
                }}
              />
              <R.Legend />
              <R.Bar
                dataKey="compliance"
                fill={chartColors[0]}
                radius={[12, 12, 0, 0]}
              />
              <R.Bar
                dataKey="teamSize"
                fill={chartColors[1]}
                radius={[12, 12, 0, 0]}
              />
            </R.BarChart>
          </R.ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  );
};
