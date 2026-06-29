"use client";

import { TOrgReportPieChart } from "@/types/org-dashboard.types";
import { GlassCard } from "@elements/glass-card";

import * as R from "recharts";

export const OrgReportsDepartmentPieChart = ({ hook }: TOrgReportPieChart) => {
  const { t, departmentComplianceChartData, hasDepartmentComplianceData } =
    hook;

  return (
    <GlassCard>
      <div className="relative z-10">
        <h2 className="text-xl font-medium">
          {t("organizationDashboard.reports.charts.department.title")}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {t("organizationDashboard.reports.charts.department.description")}
        </p>

        <div className="mt-6 h-80">
          {hasDepartmentComplianceData ? (
            <R.ResponsiveContainer width="100%" height="100%">
              <R.PieChart>
                <R.Pie
                  outerRadius={105}
                  dataKey="compliance"
                  nameKey="departmentTitle"
                  data={departmentComplianceChartData}
                  label={({ value }) => `${Number(value ?? 0).toFixed(2)}%`}
                >
                  {departmentComplianceChartData.map((item) => (
                    <R.Cell
                      key={item.departmentId ?? item.departmentTitle}
                      fill={item.color}
                    />
                  ))}
                </R.Pie>

                <R.Tooltip
                  formatter={(value, name) => [
                    `${Number(value ?? 0).toFixed(2)}%`,
                    name,
                  ]}
                  contentStyle={{
                    borderRadius: "1rem",
                    background: "var(--popover)",
                    color: "var(--popover-foreground)",
                    border: "1px solid var(--glass-bordser)",
                    boxShadow: "0 20px 60px oklch(0.18 0.08 255 / 0.18)",
                  }}
                />
              </R.PieChart>
            </R.ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {t("organizationDashboard.reports.charts.department.empty")}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
