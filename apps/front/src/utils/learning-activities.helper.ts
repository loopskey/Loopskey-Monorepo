import type { ProfessionalPduActivityFilterInput } from "@/lib/graphql/generated";
import type { TPduActivityFilters } from "@/types/professional-dashboard.types";
import { PduSource } from "@/lib/graphql/generated";

// Pure helpers for the "My Learning Activities" toolbar. Keeping the filter
// construction here means the Year / Type / Certificate selections map to the
// backend filter input in exactly one tested place.

export const ACTIVITY_YEAR_SPAN = 6;

/** Ordered newest-first so the current reporting year is the first option. */
export const buildActivityYearOptions = (
  currentYear: number,
  span: number = ACTIVITY_YEAR_SPAN,
): number[] =>
  Array.from({ length: Math.max(span, 1) }, (_, index) => currentYear - index);

export const ACTIVITY_TYPE_OPTIONS: PduSource[] = Object.values(PduSource);

export const createActivityFilters = (
  currentYear: number,
): TPduActivityFilters => ({
  search: "",
  year: currentYear,
  activityType: "ALL",
  certificate: "ALL",
});

export const hasActiveActivityFilters = (
  filters: TPduActivityFilters,
  defaultYear: number,
): boolean =>
  filters.search.trim().length > 0 ||
  filters.year !== defaultYear ||
  filters.activityType !== "ALL" ||
  filters.certificate !== "ALL";

/**
 * `search` is passed separately so the caller can supply the debounced value
 * while the toolbar keeps rendering the immediate keystrokes.
 */
export const buildActivityFilterInput = ({
  filters,
  search,
}: {
  filters: TPduActivityFilters;
  search: string;
}): ProfessionalPduActivityFilterInput => {
  const trimmed = search.trim();
  return {
    search: trimmed.length > 0 ? trimmed : undefined,
    reportingYear: filters.year,
    activityType:
      filters.activityType === "ALL" ? undefined : filters.activityType,
    hasCertificate:
      filters.certificate === "ALL" ? undefined : filters.certificate === "WITH",
  };
};
