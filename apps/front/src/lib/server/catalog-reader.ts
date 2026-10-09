import { CourseFilterFacetsDocument } from "@/lib/graphql/operations/course";
import { CoursesDocument } from "@/lib/graphql/operations/course";
import { EventFilterFacetsDocument } from "@/lib/graphql/operations/event";
import { EventsDocument } from "@/lib/graphql/operations/event";
import { PodcastFilterFacetsDocument } from "@/lib/graphql/operations/podcast";
import { PodcastsDocument } from "@/lib/graphql/operations/podcast";
import { YoutubeChannelFilterFacetsDocument } from "@/lib/graphql/operations/youtube";
import { YouTubeChannelsDocument } from "@/lib/graphql/operations/youtube";
import { CourseSortField, EventSortDirection } from "@/lib/graphql/base";
import { EventSortField, PodcastSortDirection } from "@/lib/graphql/base";
import { PodcastSortField, SortDirection } from "@/lib/graphql/base";
import { YouTubeChannelSortDirection } from "@/lib/graphql/base";
import { YouTubeChannelSortField } from "@/lib/graphql/base";
import { CATALOG_PAGE_SIZE } from "@/lib/content-catalog/catalog-href";
import { UpstreamFailureError } from "@/lib/server/graphql-server";
import { executeServerGraphql } from "@/lib/server/graphql-server";
import { memoize } from "@/lib/server/public-content";

import type { CatalogQuery } from "@/lib/content-catalog/catalog-href";
import type { CoursesQuery } from "@/lib/graphql/operations/course";
import type { EventsQuery } from "@/lib/graphql/operations/event";
import type { PodcastsQuery } from "@/lib/graphql/operations/podcast";
import type { YouTubeChannelsQuery } from "@/lib/graphql/operations/youtube";
import type { TContentTab } from "@/types/content-module.types";

export const CURSOR_INVALID_CODE = "CATALOG_CURSOR_INVALID";
export const CURSOR_EXPIRED_CODE = "CATALOG_CURSOR_EXPIRED";

export type CatalogPageInfo = {
  hasNextPage: boolean;
  nextCursor?: string | null;
  hasPreviousPage: boolean;
  previousCursor?: string | null;
};

type PageOf<TTab extends TContentTab, TItem> = {
  tab: TTab;
  items: TItem[];
  totalCount: number;
  pageInfo: CatalogPageInfo;
};

export type CatalogPageData =
  | PageOf<"courses", CoursesQuery["courses"]["items"][number]>
  | PageOf<"events", EventsQuery["events"]["items"][number]>
  | PageOf<"podcasts", PodcastsQuery["podcasts"]["items"][number]>
  | PageOf<"youtube", YouTubeChannelsQuery["youtubeChannels"]["items"][number]>;

export type CatalogRead =
  | { kind: "page"; page: CatalogPageData }
  | { kind: "invalid-cursor" }
  | { kind: "expired-cursor" };

export type CatalogFacets = {
  categories: Array<{ value: string; count: number }>;
  levels: Array<{ value: string; count: number }>;
  types: Array<{ value: string; count: number }>;
  ratings: Array<{ minimum: number; count: number }>;
};

type ListDefinition = {
  field: string;
  operation: string;
  document: { toString(): string };
  variables: Record<string, unknown>;
};

const listFilter = (query: CatalogQuery) => ({
  search: query.search,
  category: query.category,
});

const pagination = (query: CatalogQuery) => ({
  take: CATALOG_PAGE_SIZE,
  cursor: query.after,
});

const listDefinition = (query: CatalogQuery): ListDefinition => {
  switch (query.tab) {
    case "events":
      return {
        field: "events",
        operation: "Events",
        document: EventsDocument,
        variables: {
          filter: { ...listFilter(query), type: query.eventType },
          pagination: pagination(query),
          sort: {
            field: EventSortField.StartDate,
            direction: EventSortDirection.Asc,
          },
        },
      };
    case "podcasts":
      return {
        field: "podcasts",
        operation: "Podcasts",
        document: PodcastsDocument,
        variables: {
          filter: listFilter(query),
          pagination: pagination(query),
          sort: {
            field: PodcastSortField.CreatedAt,
            direction: PodcastSortDirection.Desc,
          },
        },
      };
    case "youtube":
      return {
        field: "youtubeChannels",
        operation: "YouTubeChannels",
        document: YouTubeChannelsDocument,
        variables: {
          filter: listFilter(query),
          pagination: pagination(query),
          sort: {
            field: YouTubeChannelSortField.CreatedAt,
            direction: YouTubeChannelSortDirection.Desc,
          },
        },
      };
    default:
      return {
        field: "courses",
        operation: "Courses",
        document: CoursesDocument,
        variables: {
          filter: {
            ...listFilter(query),
            level: query.level,
            minRating: query.rating ? Number(query.rating) : undefined,
          },
          pagination: pagination(query),
          sort: {
            field: CourseSortField.CreatedAt,
            direction: SortDirection.Desc,
          },
        },
      };
  }
};

const readList = async (serialized: string): Promise<CatalogRead> => {
  const query = JSON.parse(serialized) as CatalogQuery;
  const definition = listDefinition(query);
  const result = await executeServerGraphql({
    ...definition,
    rejectionCodes: [CURSOR_INVALID_CODE, CURSOR_EXPIRED_CODE],
  });
  if (result.kind === "rejected")
    return result.code === CURSOR_EXPIRED_CODE
      ? { kind: "expired-cursor" }
      : { kind: "invalid-cursor" };
  if (result.kind !== "found") throw new UpstreamFailureError("schema");
  const value = result.value as unknown as Omit<CatalogPageData, "tab">;
  if (!Array.isArray(value.items) || !value.pageInfo)
    throw new UpstreamFailureError("schema");
  return {
    kind: "page",
    page: { ...value, tab: query.tab } as CatalogPageData,
  };
};

const readCachedList = memoize(readList);

export const readCatalog = (query: CatalogQuery) =>
  readCachedList(JSON.stringify(query));

type FacetDefinition = {
  field: string;
  operation: string;
  document: { toString(): string };
};

const FACET_DEFINITIONS: Record<TContentTab, FacetDefinition> = {
  courses: {
    field: "courseFilterFacets",
    operation: "CourseFilterFacets",
    document: CourseFilterFacetsDocument,
  },
  events: {
    field: "eventFilterFacets",
    operation: "EventFilterFacets",
    document: EventFilterFacetsDocument,
  },
  podcasts: {
    field: "podcastFilterFacets",
    operation: "PodcastFilterFacets",
    document: PodcastFilterFacetsDocument,
  },
  youtube: {
    field: "youtubeChannelFilterFacets",
    operation: "YoutubeChannelFilterFacets",
    document: YoutubeChannelFilterFacetsDocument,
  },
};

const readFacetsFor = async (tab: string): Promise<CatalogFacets | null> => {
  const definition = FACET_DEFINITIONS[tab as TContentTab];
  try {
    const result = await executeServerGraphql({
      ...definition,
      variables: {},
    });
    if (result.kind !== "found") return null;
    const value = result.value as Partial<CatalogFacets>;
    return {
      categories: value.categories ?? [],
      levels: value.levels ?? [],
      types: value.types ?? [],
      ratings: value.ratings ?? [],
    };
  } catch (error) {
    if (error instanceof UpstreamFailureError) return null;
    throw error;
  }
};

export const readCatalogFacets = memoize(readFacetsFor);
