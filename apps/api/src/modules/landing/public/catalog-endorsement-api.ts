export const CATALOG_ENDORSEMENT_API = Symbol("CATALOG_ENDORSEMENT_API");

export type CatalogReference = {
  readonly contentId: string;
  readonly contentType: string;
};

export type CatalogItemProjection = {
  readonly title: string;
  readonly contentId: string;
  readonly contentType: string;
  readonly isAvailable: boolean;
  readonly provider: string | null;
  readonly imageUrl: string | null;
};

export type CatalogSearchQuery = {
  readonly take: number;
  readonly search?: string | null;
  readonly contentType?: string | null;
};

export interface CatalogEndorsementApi {
  searchCatalog(query: CatalogSearchQuery): Promise<CatalogItemProjection[]>;
  resolveCatalogItems(
    references: readonly CatalogReference[],
  ): Promise<CatalogItemProjection[]>;
}
