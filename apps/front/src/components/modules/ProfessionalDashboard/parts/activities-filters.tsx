"use client";

import { TPduActivityCertificateFilter } from "@/types/professional-dashboard.types";
import { TPduActivityFiltersProps } from "@/types/professional-dashboard.types";
import { TPduActivityType } from "@/types/professional-dashboard.types";
import { Button } from "@ui/button";
import { Input } from "@ui/input";

import * as L from "lucide-react";
import * as S from "@ui/select";

const PREFIX = "professionalDashboard.cpdPduTracker.filters";

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
    <div className="rounded-lg border p-5">
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
        <div className="relative">
          <L.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            placeholder={t(`${PREFIX}.searchPlaceholder`)}
            className="h-11 rounded-md bg-muted pl-9"
            onChange={(event) => onChange("search", event.target.value)}
          />
        </div>

        <S.Select
          value={String(filters.year)}
          onValueChange={(value) => onChange("year", Number(value))}
        >
          <S.SelectTrigger className="h-11 w-full rounded-md bg-muted">
            <S.SelectValue placeholder={t(`${PREFIX}.reportingYear`)} />
          </S.SelectTrigger>
          <S.SelectContent>
            {yearOptions.map((year) => (
              <S.SelectItem key={year} value={String(year)}>
                {year}
              </S.SelectItem>
            ))}
          </S.SelectContent>
        </S.Select>

        <S.Select
          value={filters.activityType}
          disabled={isLoading || activityTypeOptions.length === 0}
          onValueChange={(value) =>
            onChange("activityType", value as TPduActivityType)
          }
        >
          <S.SelectTrigger className="h-11 w-full rounded-md bg-muted">
            <S.SelectValue placeholder={t(`${PREFIX}.activityType`)} />
          </S.SelectTrigger>
          <S.SelectContent>
            <S.SelectItem value="ALL">{t(`${PREFIX}.any`)}</S.SelectItem>
            {activityTypeOptions.map((option) => (
              <S.SelectItem key={option} value={option}>
                {t(
                  `professionalDashboard.cpdPduTracker.activityTypes.${option}`,
                )}
              </S.SelectItem>
            ))}
          </S.SelectContent>
        </S.Select>

        <S.Select
          value={filters.certificate}
          onValueChange={(value) =>
            onChange("certificate", value as TPduActivityCertificateFilter)
          }
        >
          <S.SelectTrigger className="h-11 w-full rounded-md bg-muted">
            <S.SelectValue placeholder={t(`${PREFIX}.certificate`)} />
          </S.SelectTrigger>
          <S.SelectContent>
            {CERTIFICATE_VALUES.map((value) => (
              <S.SelectItem key={value} value={value}>
                {value === "ALL"
                  ? t(`${PREFIX}.any`)
                  : value === "WITH"
                    ? t(`${PREFIX}.hasCertificate`)
                    : t(`${PREFIX}.noCertificate`)}
              </S.SelectItem>
            ))}
          </S.SelectContent>
        </S.Select>
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
