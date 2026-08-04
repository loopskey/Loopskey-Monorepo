export const CATALOG_ORGANIZATION_API = Symbol("CATALOG_ORGANIZATION_API");

export type OrganizationEventCatalogQuery = {
  readonly search?: string;
  readonly category?: string;
  readonly type?: string;
  readonly deliveryMode?: string;
  readonly cursor?: string;
  readonly take: number;
};

export interface CatalogOrganizationApi {
  assertAssignmentTarget(command: {
    readonly courseId?: string;
    readonly eventId?: string;
  }): Promise<void>;
  eventCatalog(query: OrganizationEventCatalogQuery): Promise<{
    readonly items: readonly object[];
    readonly totalCount: number;
    readonly pageInfo: {
      readonly hasNextPage: boolean;
      readonly nextCursor: string | null;
    };
  }>;
}
