import { ProfessionalPduActivityFilterInput } from "@/lib/graphql/generated";
import { PduSource } from "@/lib/graphql/generated";

import * as T from "@/types/professional-dashboard.types";

export const ACTIVITY_YEAR_SPAN = 6;

export const buildActivityYearOptions = (
  currentYear: number,
  span: number = ACTIVITY_YEAR_SPAN,
): number[] =>
  Array.from({ length: Math.max(span, 1) }, (_, index) => currentYear - index);

export const ACTIVITY_TYPE_OPTIONS: PduSource[] = Object.values(PduSource);

export const createActivityFilters = (
  currentYear: number,
): T.TPduActivityFilters => ({
  search: "",
  year: currentYear,
  activityType: "ALL",
  certificate: "ALL",
});

export const hasActiveActivityFilters = (
  filters: T.TPduActivityFilters,
  defaultYear: number,
): boolean =>
  filters.search.trim().length > 0 ||
  filters.year !== defaultYear ||
  filters.activityType !== "ALL" ||
  filters.certificate !== "ALL";

export const buildActivityFilterInput = ({
  filters,
  search,
}: {
  filters: T.TPduActivityFilters;
  search: string;
}): ProfessionalPduActivityFilterInput => {
  const trimmed = search.trim();
  return {
    search: trimmed.length > 0 ? trimmed : undefined,
    reportingYear: filters.year,
    activityType:
      filters.activityType === "ALL" ? undefined : filters.activityType,
    hasCertificate:
      filters.certificate === "ALL"
        ? undefined
        : filters.certificate === "WITH",
  };
};

// ============ List-state preservation ============
export type TActivityListState = {
  filters: T.TPduActivityFilters;
  cursorStack: string[];
  page: number;
};

type ReadableParams = Pick<URLSearchParams, "get">;

const ACTIVITY_TYPE_VALUES = new Set<string>(Object.values(PduSource));

const isActivityType = (value: string): value is T.TPduActivityType =>
  value === "ALL" || ACTIVITY_TYPE_VALUES.has(value);

const isCertificateFilter = (
  value: string,
): value is T.TPduActivityCertificateFilter =>
  value === "ALL" || value === "WITH" || value === "WITHOUT";

export const readActivityListState = (
  params: ReadableParams | null | undefined,
  currentYear: number,
): TActivityListState => {
  const filters = createActivityFilters(currentYear);

  if (!params) return { filters, cursorStack: [], page: 1 };

  const search = params.get("search");
  if (search) filters.search = search;

  const yearRaw = params.get("year");
  const year = yearRaw ? Number(yearRaw) : Number.NaN;
  if (Number.isInteger(year)) filters.year = year;

  const type = params.get("type");
  if (type && isActivityType(type)) filters.activityType = type;

  const cert = params.get("cert");
  if (cert && isCertificateFilter(cert)) filters.certificate = cert;

  const cursorStack = (params.get("cursors") ?? "")
    .split(",")
    .map((cursor) => cursor.trim())
    .filter(Boolean);

  return { filters, cursorStack, page: cursorStack.length + 1 };
};

export const activityListStateToSearchParams = (
  state: TActivityListState,
  currentYear: number,
): URLSearchParams => {
  const params = new URLSearchParams();
  const search = state.filters.search.trim();
  if (search) params.set("search", search);
  if (state.filters.year !== currentYear)
    params.set("year", String(state.filters.year));
  if (state.filters.activityType !== "ALL")
    params.set("type", state.filters.activityType);
  if (state.filters.certificate !== "ALL")
    params.set("cert", state.filters.certificate);
  if (state.cursorStack.length > 0)
    params.set("cursors", state.cursorStack.join(","));
  return params;
};

const DASHBOARD_PATH = "/dashboard/professional";

export const buildActivityDetailHref = (
  activityId: string,
  state: TActivityListState,
  currentYear: number,
): string => {
  const params = activityListStateToSearchParams(state, currentYear);
  params.set("tab", "activity-detail");
  params.set("id", activityId);
  return `${DASHBOARD_PATH}?${params.toString()}`;
};

export const buildTrackerReturnHref = (
  params: ReadableParams | null | undefined,
  currentYear: number,
): string => {
  const state = readActivityListState(params, currentYear);
  const search = activityListStateToSearchParams(state, currentYear);
  search.set("tab", "cpd-pdu-tracker");
  return `${DASHBOARD_PATH}?${search.toString()}`;
};

export const buildActivityEditHref = (activityId: string): string =>
  `${DASHBOARD_PATH}?tab=add-activity&id=${encodeURIComponent(activityId)}`;
