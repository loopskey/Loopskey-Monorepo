"use client";

import { TPduActivityCertificateFilter } from "@/types/professional-dashboard.types";
import { TPduActivityFiltersProps } from "@/types/professional-dashboard.types";
import { TPduActivityType } from "@/types/professional-dashboard.types";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";

import * as L from "lucide-react";

const PREFIX = "professionalDashboard.cpdPduTracker.filters";

const SELECT_CLASS =
  "h-11 w-full rounded-2xl border border-input bg-background/60 px-3 text-sm outline-none transition-colors focus:border-primary/55 focus:ring-2 focus:ring-primary/20";

const CERTIFICATE_VALUES: TPduActivityCertificateFilter[] = [
  "ALL",
  "WITH",
  "WITHOUT",
];

export const ActivitiesFilters = ({
  t,
  filters,
  onChange,
  onReset,
  isFiltered,
  isLoading,
  yearOptions,
  activityTypeOptions,
}: TPduActivityFiltersProps) => {
  return (
    <div className="rounded-[1.75rem] border border-glass-border bg-background/40 p-5">
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label
            htmlFor="activity-search"
            className="text-xs font-medium text-muted-foreground"
          >
            {t(`${PREFIX}.search`)}
          </Label>
          <div className="relative">
            <L.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="activity-search"
              value={filters.search}
              placeholder={t(`${PREFIX}.searchPlaceholder`)}
              className="h-11 rounded-2xl bg-background/60 pl-9"
              onChange={(event) => onChange("search", event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="activity-year"
            className="text-xs font-medium text-muted-foreground"
          >
            {t(`${PREFIX}.reportingYear`)}
          </Label>
          <select
            id="activity-year"
            className={SELECT_CLASS}
            value={String(filters.year)}
            onChange={(event) => onChange("year", Number(event.target.value))}
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="activity-type"
            className="text-xs font-medium text-muted-foreground"
          >
            {t(`${PREFIX}.activityType`)}
          </Label>
          <select
            id="activity-type"
            className={SELECT_CLASS}
            value={filters.activityType}
            disabled={isLoading || activityTypeOptions.length === 0}
            onChange={(event) =>
              onChange("activityType", event.target.value as TPduActivityType)
            }
          >
            <option value="ALL">{t(`${PREFIX}.any`)}</option>
            {activityTypeOptions.map((option) => (
              <option key={option} value={option}>
                {t(
                  `professionalDashboard.cpdPduTracker.activityTypes.${option}`,
                )}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="activity-certificate"
            className="text-xs font-medium text-muted-foreground"
          >
            {t(`${PREFIX}.certificate`)}
          </Label>
          <select
            id="activity-certificate"
            className={SELECT_CLASS}
            value={filters.certificate}
            onChange={(event) =>
              onChange(
                "certificate",
                event.target.value as TPduActivityCertificateFilter,
              )
            }
          >
            {CERTIFICATE_VALUES.map((value) => (
              <option key={value} value={value}>
                {value === "ALL"
                  ? t(`${PREFIX}.any`)
                  : value === "WITH"
                    ? t(`${PREFIX}.hasCertificate`)
                    : t(`${PREFIX}.noCertificate`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isFiltered && (
        <div className="mt-4 flex justify-end">
          <Button type="button" radius="xl" variant="cancel" onClick={onReset}>
            <L.FilterX className="h-4 w-4" />
            {t(`${PREFIX}.clear`)}
          </Button>
        </div>
      )}
    </div>
  );
};
