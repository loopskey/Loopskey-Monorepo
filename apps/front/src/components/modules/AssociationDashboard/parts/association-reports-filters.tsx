"use client";

import { TAssociationReportsFilters } from "@/types/association-dashboard.types";
import { AssociationReportPeriod } from "@/lib/graphql/base";
import { Checkbox } from "@ui/checkbox";
import { Button } from "@ui/button";
import { Input } from "@ui/input";

import * as REPORTS from "@utils/association-reports";
import * as S from "@ui/select";
import * as L from "lucide-react";

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

  const isFiltered = REPORTS.isAssociationReportFiltered(filter);

  const field = (
    id: string,
    title: string,
    value: string,
    onChange: (next: string) => void,
    options: { value: string; label: string }[],
  ) => (
    <div>
      <label htmlFor={id} className="text-xs uppercase text-muted-foreground">
        {title}
      </label>

      <S.Select value={value} onValueChange={onChange}>
        <S.SelectTrigger id={id} className="mt-1 rounded-2xl">
          <S.SelectValue />
        </S.SelectTrigger>

        <S.SelectContent className="z-[9999] rounded-2xl">
          {options.map((option) => (
            <S.SelectItem key={option.value} value={option.value}>
              {option.label}
            </S.SelectItem>
          ))}
        </S.SelectContent>
      </S.Select>
    </div>
  );

  const dateField = (
    id: string,
    title: string,
    value: string,
    onChange: (next: string) => void,
  ) => (
    <div>
      <label htmlFor={id} className="text-xs uppercase text-muted-foreground">
        {title}
      </label>

      <Input
        id={id}
        type="date"
        value={value}
        className="mt-1 rounded-2xl"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );

  return (
    <fieldset className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <legend className="sr-only">{label("filters.legend")}</legend>

      {field(
        "association-reports-period",
        label("filters.period"),
        filter.period,
        (next) => setFilter({ period: next as AssociationReportPeriod }),
        REPORTS.ASSOCIATION_REPORT_PERIODS.map((period) => ({
          value: period,
          label: label(`periods.${period}`),
        })),
      )}

      {isCustom &&
        dateField(
          "association-reports-from",
          label("filters.from"),
          filter.startDate,
          (next) => setFilter({ startDate: next }),
        )}

      {isCustom &&
        dateField(
          "association-reports-to",
          label("filters.to"),
          filter.endDate,
          (next) => setFilter({ endDate: next }),
        )}

      {field(
        "association-reports-group",
        label("filters.group"),
        filter.groupId,
        (next) => setFilter({ groupId: next }),
        [
          {
            value: REPORTS.ALL_FILTER_VALUE,
            label: label("filters.allGroups"),
          },
          ...groupOptions,
        ],
      )}

      {field(
        "association-reports-requirement",
        label("filters.requirement"),
        filter.requirementId,
        (next) => setFilter({ requirementId: next }),
        [
          {
            value: REPORTS.ALL_FILTER_VALUE,
            label: label("filters.allRequirements"),
          },
          ...requirementOptions,
        ],
      )}

      <div className="flex items-end gap-3 md:col-span-2 xl:col-span-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="association-reports-inactive"
            checked={filter.includeInactive}
            onCheckedChange={(checked) =>
              setFilter({ includeInactive: checked === true })
            }
          />

          <label htmlFor="association-reports-inactive" className="text-sm">
            {label("filters.includeInactive")}
          </label>
        </div>

        {isFiltered && (
          <Button
            size="sm"
            radius="xl"
            type="button"
            variant="glass"
            onClick={resetFilter}
          >
            <L.FilterX className="h-4 w-4" />
            {label("filters.clear")}
          </Button>
        )}
      </div>
    </fieldset>
  );
};
