export const PROFESSIONAL_CATALOG_API = Symbol("PROFESSIONAL_CATALOG_API");

export interface ProfessionalCatalogApi {
  searchCourseIds(search: string): Promise<string[]>;
  courses(ids: string[]): Promise<Record<string, unknown>[]>;
  roadmaps(ids: string[]): Promise<Record<string, unknown>[]>;
  searchRoadmapIds(search: string): Promise<string[]>;
  exploreRoadmaps(input: {
    excludedIds: string[];
    search?: string;
    cursor?: string;
    take: number;
  }): Promise<{ rows: Record<string, unknown>[]; totalCount: number }>;
  calendarRegistrations(input: {
    userId: string;
    search?: string;
    deliveryMode?: string;
    status?: string;
    from?: Date;
    to?: Date;
    cursor?: string;
    take: number;
  }): Promise<{ rows: Record<string, unknown>[]; totalCount: number }>;
  upcomingRegistrationCount(userId: string): Promise<number>;
}
