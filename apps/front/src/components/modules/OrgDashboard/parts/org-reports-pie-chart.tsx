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

                <R.Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px" }}
                />

                <R.Tooltip
                  formatter={(value, name) => [
                    `${Number(value ?? 0).toFixed(2)}%`,
                    name,
                  ]}
                  contentStyle={{
                    borderRadius: "8px",
                    background: "var(--popover)",
                    color: "var(--popover-foreground)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 6px 18px -8px rgb(13 25 61 / 12%)",
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
