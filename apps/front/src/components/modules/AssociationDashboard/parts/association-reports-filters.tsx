"use client";

import { TAssociationReportsFilters } from "@/types/association-dashboard.types";
import { AssociationReportPeriod } from "@/lib/graphql/base";
import { DataTableFilters } from "@elements/data-table/data-table-filters";

import * as REPORTS from "@utils/association-reports";

const toPeriod = (value: string): AssociationReportPeriod =>
  REPORTS.ASSOCIATION_REPORT_PERIODS.find((period) => period === value) ??
  REPORTS.DEFAULT_ASSOCIATION_REPORT_FILTER.period;

export const AssociationReportsFilters = ({
  hook,
}: TAssociationReportsFilters) => {
  const {
    t,
    filter,
    setFilter,
    resetFilter,
    groupOptions,
    requirementOptions,
  } = hook;

  const label = (key: string) => t(`associationDashboard.reports.${key}`);

  const isCustom = filter.period === AssociationReportPeriod.Custom;

  return (
    <DataTableFilters
      onReset={resetFilter}
      isFiltered={REPORTS.isAssociationReportFiltered(filter)}
      filters={[
        {
          type: "select",
          id: "period",
          value: filter.period,
          label: label("filters.period"),
          defaultValue: REPORTS.DEFAULT_ASSOCIATION_REPORT_FILTER.period,
          onChange: (next) => setFilter({ period: toPeriod(next) }),
          options: REPORTS.ASSOCIATION_REPORT_PERIODS.map((period) => ({
            value: period,
            label: label(`periods.${period}`),
          })),
        },
        isCustom && {
          type: "date",
          id: "from",
          value: filter.startDate,
          label: label("filters.from"),
          onChange: (next) => setFilter({ startDate: next }),
        },
        isCustom && {
          type: "date",
          id: "to",
          value: filter.endDate,
          label: label("filters.to"),
          onChange: (next) => setFilter({ endDate: next }),
        },
        {
          type: "select",
          id: "group",
          value: filter.groupId,
          label: label("filters.group"),
          defaultValue: REPORTS.ALL_FILTER_VALUE,
          onChange: (next) => setFilter({ groupId: next }),
          options: [
            {
              value: REPORTS.ALL_FILTER_VALUE,
              label: label("filters.allGroups"),
            },
            ...groupOptions,
          ],
        },
        {
          type: "select",
          id: "requirement",
          value: filter.requirementId,
          label: label("filters.requirement"),
          defaultValue: REPORTS.ALL_FILTER_VALUE,
          onChange: (next) => setFilter({ requirementId: next }),
          options: [
            {
              value: REPORTS.ALL_FILTER_VALUE,
              label: label("filters.allRequirements"),
            },
            ...requirementOptions,
          ],
        },
        {
          type: "toggle",
          id: "includeInactive",
          value: filter.includeInactive,
          label: label("filters.includeInactive"),
          onChange: (next) => setFilter({ includeInactive: next }),
        },
      ]}
    />
  );
};
