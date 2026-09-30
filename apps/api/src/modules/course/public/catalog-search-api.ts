export const COURSE_CATALOG_SEARCH_API = Symbol("COURSE_CATALOG_SEARCH_API");

export type LandingCatalogSearchQuery = {
  readonly search: string;
  readonly take: number;
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

export interface CourseCatalogSearchApi {
  searchCatalog(
    query: LandingCatalogSearchQuery,
  ): Promise<LandingCatalogCandidate[]>;
}
