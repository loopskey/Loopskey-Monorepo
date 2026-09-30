export const EVENT_CATALOG_SEARCH_API = Symbol("EVENT_CATALOG_SEARCH_API");

export type LandingCatalogSearchQuery = {
  readonly take: number;
  readonly search: string;
  readonly category?: string | null;
};

export type LandingCatalogCandidate = {
  readonly slug: string;
  readonly title: string;
  readonly score: number;
  readonly recency: Date;
  readonly rating: number;
  readonly category: string;
  readonly contentId: string;
  readonly imageUrl: string | null;
  readonly startDate?: Date | null;
  readonly videoCount?: number | null;
  readonly episodeCount?: number | null;
  readonly durationMinutes?: number | null;
};

export interface EventCatalogSearchApi {
  searchCatalog(
    query: LandingCatalogSearchQuery,
  ): Promise<LandingCatalogCandidate[]>;
}
