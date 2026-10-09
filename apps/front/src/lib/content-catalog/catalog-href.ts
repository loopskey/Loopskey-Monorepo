import type { TContentTab } from "@/types/content-module.types";

export const CONTENT_PATH = "/content";
export const DEFAULT_TAB: TContentTab = "courses";
export const MAX_SEARCH_LENGTH = 100;
export const MIN_SEARCH_LENGTH = 2;
export const CATALOG_PAGE_SIZE = 12;

export type CatalogQuery = {
  tab: TContentTab;
  after?: string;
  search?: string;
  category?: string;
  level?: string;
  rating?: string;
  eventType?: string;
};

export const normalizeSearchTerm = (value: string) =>
  value.trim().replace(/\s+/g, " ");

export const hasContentFilters = (query: CatalogQuery) =>
  Boolean(
    query.search ||
      query.category ||
      query.level ||
      query.rating ||
      query.eventType,
  );

export const buildCatalogHref = (query: CatalogQuery) => {
  const params = new URLSearchParams();
  if (query.tab !== DEFAULT_TAB) params.set("tab", query.tab);
  if (query.search) params.set("q", query.search);
  if (query.category) params.set("category", query.category);
  if (query.level) params.set("level", query.level);
  if (query.rating) params.set("rating", query.rating);
  if (query.eventType) params.set("eventType", query.eventType);
  if (query.after) params.set("after", query.after);
  const queryString = params.toString();
  return queryString ? `${CONTENT_PATH}?${queryString}` : CONTENT_PATH;
};

export const tabHref = (tab: TContentTab) => buildCatalogHref({ tab });

export const firstPageHref = (query: CatalogQuery) =>
  buildCatalogHref({ ...query, after: undefined });

export const withCursor = (query: CatalogQuery, after: string | null) =>
  buildCatalogHref({ ...query, after: after ?? undefined });
