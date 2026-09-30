export const YOUTUBE_CATALOG_SEARCH_API = Symbol("YOUTUBE_CATALOG_SEARCH_API");

export type LandingCatalogSearchQuery = {
  readonly take: number;
  readonly search: string;
  readonly category?: string | null;
};

export type LandingCatalogCandidate = {
  readonly slug: string;
  readonly score: number;
  readonly title: string;
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

export interface YouTubeCatalogSearchApi {
  searchCatalog(
    query: LandingCatalogSearchQuery,
  ): Promise<LandingCatalogCandidate[]>;
}
