"use client";

import { rangeOrgReportOptions } from "@/utils/constant";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { TOrgReportFilters } from "@/types/org-dashboard.types";
import { GlassCard } from "@elements/glass-card";
import { Form } from "@ui/form";

export const OrgReportsFilters = ({ hook }: TOrgReportFilters) => {
  const { t, form, range, departmentOptions } = hook;

  return (
    <GlassCard className="print:hidden">
      <Form {...form}>
        <div className="relative z-10 grid gap-4 md:grid-cols-3">
          <FloatingSelectField
            name="range"
            control={form.control}
            options={rangeOrgReportOptions.map((item) => ({
              value: item.value,
              label: t(`organizationDashboard.reports.ranges.${item.value}`),
            }))}
            label={t("organizationDashboard.reports.filters.range")}
          />

          <FloatingSelectField
            name="departmentId"
            control={form.control}
            options={departmentOptions}
            label={t("organizationDashboard.reports.filters.department")}
          />

          {range === "CUSTOM" && (
            <>
              <FloatingInputField
                type="date"
                name="startDate"
                control={form.control}
                label={t("organizationDashboard.reports.filters.startDate")}
              />

              <FloatingInputField
                type="date"
                name="endDate"
                control={form.control}
                label={t("organizationDashboard.reports.filters.endDate")}
              />
            </>
          )}
        </div>
      </Form>
    </GlassCard>
  );
};
