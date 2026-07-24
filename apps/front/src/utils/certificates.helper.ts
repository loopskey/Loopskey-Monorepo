import { CertificateStatusFilter } from "@/lib/graphql/generated";
import { CertificateStatus } from "@/lib/graphql/generated";
import { CertificateSort } from "@/lib/graphql/generated";

import * as T from "@/types/professional-dashboard.types";

export const CERTIFICATE_ANY = "ALL";

export const CERTIFICATE_PLAN_NONE = "NONE";

export const CERTIFICATE_STATUS_OPTIONS: CertificateStatusFilter[] = [
  CertificateStatusFilter.Active,
  CertificateStatusFilter.ExpiringSoon,
  CertificateStatusFilter.Expired,
];

export const CERTIFICATE_SORT_OPTIONS: CertificateSort[] = [
  CertificateSort.Recent,
  CertificateSort.Oldest,
  CertificateSort.ExpirySoonest,
  CertificateSort.Name,
];

export const CERTIFICATE_INITIAL_FILTERS: T.TCertificateFilters = {
  search: "",
  status: CERTIFICATE_ANY,
  issuer: CERTIFICATE_ANY,
  cpdPlan: CERTIFICATE_ANY,
  sort: CertificateSort.Recent,
};

export const createCertificateFilters = (): T.TCertificateFilters => ({
  ...CERTIFICATE_INITIAL_FILTERS,
});

export const hasActiveCertificateFilters = (
  filters: T.TCertificateFilters,
): boolean =>
  filters.search.trim().length > 0 ||
  filters.status !== CERTIFICATE_ANY ||
  filters.issuer !== CERTIFICATE_ANY ||
  filters.cpdPlan !== CERTIFICATE_ANY ||
  filters.sort !== CERTIFICATE_INITIAL_FILTERS.sort;

export const buildCertificateQueryVariables = ({
  filters,
  search,
  cursor,
  take,
}: {
  filters: T.TCertificateFilters;
  search: string;
  cursor?: string;
  take: number;
}) => {
  const trimmedSearch = search.trim();
  const isUnlinked = filters.cpdPlan === CERTIFICATE_PLAN_NONE;
  const hasPlan =
    filters.cpdPlan !== CERTIFICATE_ANY &&
    filters.cpdPlan !== CERTIFICATE_PLAN_NONE;

  return {
    filter: { search: trimmedSearch.length > 0 ? trimmedSearch : undefined },
    status: filters.status === CERTIFICATE_ANY ? undefined : filters.status,
    sort: filters.sort,
    issuer: filters.issuer === CERTIFICATE_ANY ? undefined : filters.issuer,
    cpdPlanId: hasPlan ? filters.cpdPlan : undefined,
    unlinkedOnly: isUnlinked ? true : undefined,
    pagination: { take, cursor },
  };
};

export const CERTIFICATE_STATUS_TONE: Record<
  CertificateStatus,
  "active" | "warning" | "danger" | "neutral"
> = {
  [CertificateStatus.Active]: "active",
  [CertificateStatus.ExpiringSoon]: "warning",
  [CertificateStatus.Expired]: "danger",
  [CertificateStatus.Revoked]: "neutral",
};

// ============ List-state preservation ============
export type TCertificateListState = {
  filters: T.TCertificateFilters;
  cursorStack: string[];
  page: number;
  selectedId: string | null;
};

type ReadableParams = Pick<URLSearchParams, "get">;

const STATUS_VALUES = new Set<string>(Object.values(CertificateStatusFilter));
const SORT_VALUES = new Set<string>(Object.values(CertificateSort));

const isStatusFilter = (value: string): value is T.TCertificateStatusFilter =>
  value === CERTIFICATE_ANY || STATUS_VALUES.has(value);

const isSort = (value: string): value is CertificateSort =>
  SORT_VALUES.has(value);

export const readCertificateListState = (
  params: ReadableParams | null | undefined,
): TCertificateListState => {
  const filters = createCertificateFilters();

  if (!params) return { filters, cursorStack: [], page: 1, selectedId: null };

  const search = params.get("search");
  if (search) filters.search = search;

  const status = params.get("status");
  if (status && isStatusFilter(status)) filters.status = status;

  const issuer = params.get("issuer");
  if (issuer) filters.issuer = issuer;

  const plan = params.get("plan");
  if (plan) filters.cpdPlan = plan;

  const sort = params.get("sort");
  if (sort && isSort(sort)) filters.sort = sort;

  const cursorStack = (params.get("cursors") ?? "")
    .split(",")
    .map((cursor) => cursor.trim())
    .filter(Boolean);

  return {
    filters,
    cursorStack,
    page: cursorStack.length + 1,
    selectedId: params.get("selected") || null,
  };
};

export const certificateListStateToSearchParams = (
  state: TCertificateListState,
): URLSearchParams => {
  const params = new URLSearchParams();
  const search = state.filters.search.trim();

  if (search) params.set("search", search);
  if (state.filters.status !== CERTIFICATE_ANY)
    params.set("status", state.filters.status);
  if (state.filters.issuer !== CERTIFICATE_ANY)
    params.set("issuer", state.filters.issuer);
  if (state.filters.cpdPlan !== CERTIFICATE_ANY)
    params.set("plan", state.filters.cpdPlan);
  if (state.filters.sort !== CERTIFICATE_INITIAL_FILTERS.sort)
    params.set("sort", state.filters.sort);
  if (state.cursorStack.length > 0)
    params.set("cursors", state.cursorStack.join(","));
  if (state.selectedId) params.set("selected", state.selectedId);

  return params;
};

const DASHBOARD_PATH = "/dashboard/professional";

export const CERTIFICATES_TAB = "certificates";
export const CERTIFICATE_FORM_TAB = "certificate-form";

export const buildCertificateFormHref = (
  state: TCertificateListState,
  certificateId?: string,
): string => {
  const params = certificateListStateToSearchParams(state);
  params.set("tab", CERTIFICATE_FORM_TAB);
  if (certificateId) params.set("id", certificateId);
  return `${DASHBOARD_PATH}?${params.toString()}`;
};

export const buildCertificatesReturnHref = (
  params: ReadableParams | null | undefined,
  {
    selectedId,
    resetPagination = false,
  }: { selectedId?: string | null; resetPagination?: boolean } = {},
): string => {
  const state = readCertificateListState(params);
  const search = certificateListStateToSearchParams({
    ...state,
    cursorStack: resetPagination ? [] : state.cursorStack,
    selectedId: selectedId ?? state.selectedId,
  });
  search.set("tab", CERTIFICATES_TAB);
  return `${DASHBOARD_PATH}?${search.toString()}`;
};

export const buildIssuerOptions = (
  issuers: readonly string[],
  currentIssuer: string,
): string[] => {
  const unique = new Set(issuers.filter(Boolean));
  if (currentIssuer && currentIssuer !== CERTIFICATE_ANY)
    unique.add(currentIssuer);
  return [...unique].sort((left, right) => left.localeCompare(right));
};
