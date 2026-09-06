import { AssociationReportPeriod } from "@/lib/graphql/base";

import type { AssociationReportFilterInput } from "@/lib/graphql/base";

export const ASSOCIATION_REPORT_KEYS = [
  "overview-summary",
  "member-progress",
  "group-progress",
  "category-completion",
  "missing-evidence",
  "renewal-readiness",
] as const;

export type TAssociationReportKey = (typeof ASSOCIATION_REPORT_KEYS)[number];

export const ASSOCIATION_REPORT_PERIODS = [
  AssociationReportPeriod.ThisYear,
  AssociationReportPeriod.LastYear,
  AssociationReportPeriod.Last_30Days,
  AssociationReportPeriod.Last_90Days,
  AssociationReportPeriod.Custom,
] as const;

export const ALL_FILTER_VALUE = "ALL";

export const REPORT_ROWS_PER_PAGE = 25;

export const REPORT_FETCH_LIMIT = 200;

export const STALE_COMPUTED_AT_MS = 15 * 60 * 1000;

export const HEATMAP_GROUP_LIMIT = 12;

export const EXTREMES_SIZE = 10;

export type TSortDirection = "asc" | "desc";

export type TAssociationReportFilter = {
  period: AssociationReportPeriod;
  startDate: string;
  endDate: string;
  groupId: string;
  requirementId: string;
  includeInactive: boolean;
};

export type TAssociationReportView = {
  report: TAssociationReportKey | null;
  filter: TAssociationReportFilter;
  band: string;
  sort: string;
  direction: TSortDirection;
  page: number;
};

export const DEFAULT_ASSOCIATION_REPORT_FILTER: TAssociationReportFilter = {
  period: AssociationReportPeriod.ThisYear,
  startDate: "",
  endDate: "",
  groupId: ALL_FILTER_VALUE,
  requirementId: ALL_FILTER_VALUE,
  includeInactive: false,
};

const isReportKey = (value: string): value is TAssociationReportKey =>
  ASSOCIATION_REPORT_KEYS.includes(value as TAssociationReportKey);

const isPeriod = (value: string): value is AssociationReportPeriod =>
  ASSOCIATION_REPORT_PERIODS.includes(value as AssociationReportPeriod);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

type TParams = { get: (key: string) => string | null } | null | undefined;

export const readAssociationReportView = (
  params: TParams,
): TAssociationReportView => {
  const read = (key: string) => params?.get(key) ?? "";

  const report = read("report");
  const period = read("period");
  const startDate = read("from");
  const endDate = read("to");
  const groupId = read("group");
  const requirementId = read("requirement");
  const page = Number.parseInt(read("page"), 10);

  return {
    report: isReportKey(report) ? report : null,
    band: read("band") || ALL_FILTER_VALUE,
    sort: read("sort"),
    direction: read("dir") === "asc" ? "asc" : "desc",
    page: Number.isFinite(page) && page > 1 ? page : 1,
    filter: {
      period: isPeriod(period)
        ? period
        : DEFAULT_ASSOCIATION_REPORT_FILTER.period,
      startDate: ISO_DATE.test(startDate) ? startDate : "",
      endDate: ISO_DATE.test(endDate) ? endDate : "",
      groupId: groupId || ALL_FILTER_VALUE,
      requirementId: requirementId || ALL_FILTER_VALUE,
      includeInactive: read("inactive") === "1",
    },
  };
};

export const associationReportHref = (view: TAssociationReportView) => {
  const params = new URLSearchParams({ tab: "reports" });
  const { filter } = view;

  if (view.report) params.set("report", view.report);
  if (filter.period !== DEFAULT_ASSOCIATION_REPORT_FILTER.period)
    params.set("period", filter.period);
  if (filter.startDate) params.set("from", filter.startDate);
  if (filter.endDate) params.set("to", filter.endDate);
  if (filter.groupId !== ALL_FILTER_VALUE) params.set("group", filter.groupId);
  if (filter.requirementId !== ALL_FILTER_VALUE)
    params.set("requirement", filter.requirementId);
  if (filter.includeInactive) params.set("inactive", "1");
  if (view.band !== ALL_FILTER_VALUE) params.set("band", view.band);
  if (view.sort) params.set("sort", view.sort);
  if (view.sort) params.set("dir", view.direction);
  if (view.page > 1) params.set("page", String(view.page));

  return `/dashboard/association?${params.toString()}`;
};

const isExplicitRange = (filter: TAssociationReportFilter) =>
  filter.period === AssociationReportPeriod.Custom &&
  Boolean(filter.startDate) &&
  Boolean(filter.endDate);

export const toAssociationReportFilterInput = (
  filter: TAssociationReportFilter,
): AssociationReportFilterInput => ({
  period: filter.period,
  startDate: isExplicitRange(filter) ? filter.startDate : undefined,
  endDate: isExplicitRange(filter) ? filter.endDate : undefined,
  groupId: filter.groupId === ALL_FILTER_VALUE ? undefined : filter.groupId,
  requirementId:
    filter.requirementId === ALL_FILTER_VALUE
      ? undefined
      : filter.requirementId,
  includeInactive: filter.includeInactive || undefined,
});

export const isAssociationReportFiltered = (filter: TAssociationReportFilter) =>
  filter.period !== DEFAULT_ASSOCIATION_REPORT_FILTER.period ||
  filter.groupId !== ALL_FILTER_VALUE ||
  filter.requirementId !== ALL_FILTER_VALUE ||
  filter.includeInactive;

export const isCustomPeriodIncomplete = (filter: TAssociationReportFilter) =>
  filter.period === AssociationReportPeriod.Custom && !isExplicitRange(filter);

export const isComputedAtStale = (computedAt: string | null, now: number) => {
  if (!computedAt) return true;
  const at = new Date(computedAt).getTime();
  if (Number.isNaN(at)) return true;
  return now - at > STALE_COMPUTED_AT_MS;
};

export const chartTone = (color: string, weight: number) =>
  `color-mix(in oklab, ${color} ${Math.round(weight * 100)}%, transparent)`;

export const compareBy = <TRow>(
  rows: readonly TRow[],
  read: (row: TRow) => number | string | null,
  direction: TSortDirection,
) =>
  [...rows].sort((left, right) => {
    const a = read(left);
    const b = read(right);
    const order =
      typeof a === "string" || typeof b === "string"
        ? String(a ?? "").localeCompare(String(b ?? ""))
        : Number(a ?? 0) - Number(b ?? 0);
    return direction === "asc" ? order : -order;
  });

export const pageOf = <TRow>(rows: readonly TRow[], page: number) =>
  rows.slice((page - 1) * REPORT_ROWS_PER_PAGE, page * REPORT_ROWS_PER_PAGE);

export const pageCount = (total: number) =>
  Math.max(1, Math.ceil(total / REPORT_ROWS_PER_PAGE));

export const extremesOf = <TRow>(
  rows: readonly TRow[],
  percentOf: (row: TRow) => number,
) => {
  const ordered = compareBy(rows, percentOf, "desc");

  return {
    leaders: ordered.slice(0, EXTREMES_SIZE),
    laggards: ordered.slice(-EXTREMES_SIZE).reverse(),
  };
};

export const formatReportPercent = (value: number, locale: string) =>
  `${value.toLocaleString(locale)}%`;

export const formatReportDate = (
  value: string | null | undefined,
  locale: string,
  fallback: string,
) =>
  value
    ? new Date(value).toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : fallback;
