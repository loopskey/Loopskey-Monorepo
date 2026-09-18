"use client";

import { TCertificatesFiltersProps } from "@/types/professional-dashboard.types";
import { TCertificateStatusFilter } from "@/types/professional-dashboard.types";
import { CertificateSort } from "@/lib/graphql/base";
import { Button } from "@ui/button";
import { Input } from "@ui/input";

import * as H from "@/utils/certificates.helper";
import * as L from "lucide-react";
import * as S from "@ui/select";

const PREFIX = "professionalDashboard.certificates.filters";

export const CertificatesFilters = ({
  t,
  filters,
  onChange,
  onReset,
  isFiltered,
  planOptions,
  issuerOptions,
  isPlansLoading,
  isIssuersLoading,
}: TCertificatesFiltersProps) => {
  return (
    <div className="rounded-lg border p-5">
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-5">
        <div className="relative xl:col-span-1">
          <L.Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={filters.search}
            className="h-11 rounded-md pl-9"
            placeholder={t(`${PREFIX}.searchPlaceholder`)}
            onChange={(event) => onChange("search", event.target.value)}
          />
        </div>

        <S.Select
          value={filters.status}
          onValueChange={(value) =>
            onChange("status", value as TCertificateStatusFilter)
          }
        >
          <S.SelectTrigger className="h-11 w-full rounded-md">
            <S.SelectValue placeholder={t(`${PREFIX}.status`)} />
          </S.SelectTrigger>
          <S.SelectContent>
            <S.SelectItem value={H.CERTIFICATE_ANY}>
              {t(`${PREFIX}.anyStatus`)}
            </S.SelectItem>
            {H.CERTIFICATE_STATUS_OPTIONS.map((status) => (
              <S.SelectItem key={status} value={status}>
                {t(`professionalDashboard.certificates.statuses.${status}`)}
              </S.SelectItem>
            ))}
          </S.SelectContent>
        </S.Select>

        <S.Select
          value={filters.issuer}
          disabled={isIssuersLoading}
          onValueChange={(value) => onChange("issuer", value)}
        >
          <S.SelectTrigger className="h-11 w-full rounded-md">
            <S.SelectValue
              placeholder={
                isIssuersLoading
                  ? t(`${PREFIX}.loadingOptions`)
                  : t(`${PREFIX}.issuer`)
              }
            />
          </S.SelectTrigger>
          <S.SelectContent>
            <S.SelectItem value={H.CERTIFICATE_ANY}>
              {t(`${PREFIX}.anyIssuer`)}
            </S.SelectItem>
            {issuerOptions.map((issuer) => (
              <S.SelectItem key={issuer} value={issuer}>
                {issuer}
              </S.SelectItem>
            ))}
          </S.SelectContent>
        </S.Select>

        <S.Select
          value={filters.cpdPlan}
          disabled={isPlansLoading}
          onValueChange={(value) => onChange("cpdPlan", value)}
        >
          <S.SelectTrigger className="h-11 w-full rounded-md">
            <S.SelectValue
              placeholder={
                isPlansLoading
                  ? t(`${PREFIX}.loadingOptions`)
                  : t(`${PREFIX}.cpdPlan`)
              }
            />
          </S.SelectTrigger>
          <S.SelectContent>
            <S.SelectItem value={H.CERTIFICATE_ANY}>
              {t(`${PREFIX}.anyPlan`)}
            </S.SelectItem>
            <S.SelectItem value={H.CERTIFICATE_PLAN_NONE}>
              {t(`${PREFIX}.noPlan`)}
            </S.SelectItem>
            {planOptions.map((plan) => (
              <S.SelectItem key={plan.id} value={plan.id}>
                {plan.name}
              </S.SelectItem>
            ))}
          </S.SelectContent>
        </S.Select>

        <S.Select
          value={filters.sort}
          onValueChange={(value) => onChange("sort", value as CertificateSort)}
        >
          <S.SelectTrigger className="h-11 w-full rounded-md">
            <S.SelectValue placeholder={t(`${PREFIX}.sort`)} />
          </S.SelectTrigger>
          <S.SelectContent>
            {H.CERTIFICATE_SORT_OPTIONS.map((sort) => (
              <S.SelectItem key={sort} value={sort}>
                {t(`${PREFIX}.sorts.${sort}`)}
              </S.SelectItem>
            ))}
          </S.SelectContent>
        </S.Select>
      </div>

      {!isPlansLoading && planOptions.length === 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          {t(`${PREFIX}.noPlansAvailable`)}
        </p>
      )}

      {isFiltered && (
        <div className="mt-4 flex justify-end">
          <Button type="button" radius="xl" variant="cancel" onClick={onReset}>
            <L.FilterX className="h-4 w-4" aria-hidden />
            {t(`${PREFIX}.clear`)}
          </Button>
        </div>
      )}
    </div>
  );
};
