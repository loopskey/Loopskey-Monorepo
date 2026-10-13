import {
  CourseCategory,
  CourseLevel,
  EventCategory,
  EventType,
  PodcastCategory,
  YouTubeCategory,
} from "@/lib/graphql/base";
import {
  DEFAULT_TAB,
  MAX_SEARCH_LENGTH,
  MIN_SEARCH_LENGTH,
  buildCatalogHref,
  normalizeSearchTerm,
} from "@/lib/content-catalog/catalog-href";

import type { CatalogQuery } from "@/lib/content-catalog/catalog-href";
import type { TContentTab } from "@/types/content-module.types";

const MAX_CURSOR_LENGTH = 512;
const MAX_RATING = 5;

const TABS: readonly TContentTab[] = [
  "courses",
  "events",
  "podcasts",
  "youtube",
];

const CATEGORY_VALUES: Record<TContentTab, readonly string[]> = {
  courses: Object.values(CourseCategory),
  events: Object.values(EventCategory),
  podcasts: Object.values(PodcastCategory),
  youtube: Object.values(YouTubeCategory),
};

const LEVEL_VALUES: readonly string[] = Object.values(CourseLevel);
const EVENT_TYPE_VALUES: readonly string[] = Object.values(EventType);
const CURSOR_PATTERN = /^[A-Za-z0-9_-]+$/;
const RATING_PATTERN = /^[1-5](?:\.[0-9])?$/;

export type RawSearchParams = Record<string, string | string[] | undefined>;

export type ParsedCatalogQuery =
  | { kind: "valid"; query: CatalogQuery; canonicalHref: string }
  | { kind: "invalid"; tab: TContentTab };

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const isTab = (value: string): value is TContentTab =>
  (TABS as readonly string[]).includes(value);

const parseEnum = (
  raw: string | string[] | undefined,
  allowed: readonly string[],
) => {
  const value = firstValue(raw)?.trim();
  if (!value) return { ok: true as const, value: undefined };
  return allowed.includes(value)
    ? { ok: true as const, value }
    : { ok: false as const };
};

const parseRating = (raw: string | string[] | undefined) => {
  const value = firstValue(raw)?.trim();
  if (!value) return { ok: true as const, value: undefined };
  if (!RATING_PATTERN.test(value) || Number(value) > MAX_RATING)
    return { ok: false as const };
  return { ok: true as const, value: String(Number(value)) };
};

export const parseCatalogQuery = (
  params: RawSearchParams,
): ParsedCatalogQuery => {
  const rawTab = firstValue(params.tab)?.trim() || DEFAULT_TAB;
  if (!isTab(rawTab)) return { kind: "invalid", tab: DEFAULT_TAB };
  const tab = rawTab;
  const invalid = (): ParsedCatalogQuery => ({ kind: "invalid", tab });

  const rawSearch = normalizeSearchTerm(firstValue(params.q) ?? "");
  if (rawSearch.length > MAX_SEARCH_LENGTH) return invalid();
  const search = rawSearch.length >= MIN_SEARCH_LENGTH ? rawSearch : undefined;

  const after = firstValue(params.after)?.trim() || undefined;
  if (
    after &&
    (after.length > MAX_CURSOR_LENGTH || !CURSOR_PATTERN.test(after))
  )
    return invalid();

  const category = parseEnum(params.category, CATEGORY_VALUES[tab]);
  const level = parseEnum(params.level, LEVEL_VALUES);
  const rating = parseRating(params.rating);
  const eventType = parseEnum(params.eventType, EVENT_TYPE_VALUES);
  if (!category.ok || !level.ok || !rating.ok || !eventType.ok)
    return invalid();

  const query: CatalogQuery = {
    tab,
    after,
    search,
    category: category.value,
    level: tab === "courses" ? level.value : undefined,
    rating: tab === "courses" ? rating.value : undefined,
    eventType: tab === "events" ? eventType.value : undefined,
  };
  return { kind: "valid", query, canonicalHref: buildCatalogHref(query) };
};

export const isCanonicalRequest = (
  params: RawSearchParams,
  canonicalHref: string,
) => {
  const canonical = new URL(canonicalHref, "http://catalog.local");
  const expected = Object.fromEntries(canonical.searchParams.entries());
  const requestedKeys = Object.keys(params);
  if (requestedKeys.length !== Object.keys(expected).length) return false;
  return requestedKeys.every((key) => {
    const value = params[key];
    return typeof value === "string" && expected[key] === value;
  });
};
