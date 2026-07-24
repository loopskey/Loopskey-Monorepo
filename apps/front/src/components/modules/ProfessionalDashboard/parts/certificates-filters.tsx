"use client";

import { TCertificatesFiltersProps } from "@/types/professional-dashboard.types";
import { TCertificateStatusFilter } from "@/types/professional-dashboard.types";
import { CertificateSort } from "@/lib/graphql/generated";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";

import * as H from "@/utils/certificates.helper";
import * as L from "lucide-react";

const PREFIX = "professionalDashboard.certificates.filters";

const SELECT_CLASS =
  "h-11 w-full rounded-2xl border border-input bg-background/60 px-3 text-sm outline-none transition-colors focus:border-primary/55 focus:ring-2 focus:ring-primary/20 disabled:opacity-60";

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
    <div className="rounded-[1.75rem] border border-glass-border bg-background/40 p-5">
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2 xl:col-span-2">
          <Label
            htmlFor="certificate-search"
            className="text-xs font-medium text-muted-foreground"
          >
            {t(`${PREFIX}.search`)}
          </Label>
          <div className="relative">
            <L.Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="certificate-search"
              value={filters.search}
              className="h-11 rounded-2xl bg-background/60 pl-9"
              placeholder={t(`${PREFIX}.searchPlaceholder`)}
              onChange={(event) => onChange("search", event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="certificate-status"
            className="text-xs font-medium text-muted-foreground"
          >
            {t(`${PREFIX}.status`)}
          </Label>
          <select
            id="certificate-status"
            className={SELECT_CLASS}
            value={filters.status}
            onChange={(event) =>
              onChange("status", event.target.value as TCertificateStatusFilter)
            }
          >
            <option value={H.CERTIFICATE_ANY}>{t(`${PREFIX}.anyStatus`)}</option>
            {H.CERTIFICATE_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {t(`professionalDashboard.certificates.statuses.${status}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="certificate-issuer"
            className="text-xs font-medium text-muted-foreground"
          >
            {t(`${PREFIX}.issuer`)}
          </Label>
          <select
            id="certificate-issuer"
            className={SELECT_CLASS}
            value={filters.issuer}
            disabled={isIssuersLoading}
            onChange={(event) => onChange("issuer", event.target.value)}
          >
            <option value={H.CERTIFICATE_ANY}>
              {isIssuersLoading
                ? t(`${PREFIX}.loadingOptions`)
                : t(`${PREFIX}.anyIssuer`)}
            </option>
            {issuerOptions.map((issuer) => (
              <option key={issuer} value={issuer}>
                {issuer}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="certificate-plan"
            className="text-xs font-medium text-muted-foreground"
          >
            {t(`${PREFIX}.cpdPlan`)}
          </Label>
          <select
            id="certificate-plan"
            className={SELECT_CLASS}
            value={filters.cpdPlan}
            disabled={isPlansLoading}
            onChange={(event) => onChange("cpdPlan", event.target.value)}
          >
            <option value={H.CERTIFICATE_ANY}>
              {isPlansLoading
                ? t(`${PREFIX}.loadingOptions`)
                : t(`${PREFIX}.anyPlan`)}
            </option>
            <option value={H.CERTIFICATE_PLAN_NONE}>
              {t(`${PREFIX}.noPlan`)}
            </option>
            {planOptions.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
          {!isPlansLoading && planOptions.length === 0 && (
            <p className="text-xs text-muted-foreground">
              {t(`${PREFIX}.noPlansAvailable`)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="certificate-sort"
            className="text-xs font-medium text-muted-foreground"
          >
            {t(`${PREFIX}.sort`)}
          </Label>
          <select
            id="certificate-sort"
            className={SELECT_CLASS}
            value={filters.sort}
            onChange={(event) =>
              onChange("sort", event.target.value as CertificateSort)
            }
          >
            {H.CERTIFICATE_SORT_OPTIONS.map((sort) => (
              <option key={sort} value={sort}>
                {t(`${PREFIX}.sorts.${sort}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

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
