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
  roadmapCandidateCourses(
    query: RoadmapCandidateQuery,
  ): Promise<RoadmapCandidateCourseProjection[]>;

  createGeneratedRoadmap(
    input: GeneratedRoadmapInput,
    unitOfWork: UnitOfWork,
  ): Promise<{ id: string }>;
}

export type UnitOfWork = object;

export type GeneratedRoadmapStepInput = {
  readonly order: number;
  readonly title: string;
  readonly description: string;
  readonly contentId: string | null;
  readonly contentType: "EVENT" | "COURSE" | "PODCAST" | "YOUTUBE" | null;
  readonly estimatedMinutes: number | null;
};

export type GeneratedRoadmapPhaseInput = {
  readonly order: number;
  readonly title: string;
  readonly description: string;
  readonly estimatedWeeks: number;
  readonly steps: readonly GeneratedRoadmapStepInput[];
};

export type GeneratedRoadmapInput = {
  readonly slug: string;
  readonly title: string;
  readonly ownerId: string;
  readonly description: string;
  readonly coverageNote: string | null;
  readonly estimatedWeeks: number;
  readonly phases: readonly GeneratedRoadmapPhaseInput[];
};

export type RoadmapCandidateCourseProjection = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly level: string;
  readonly isFree: boolean;
  readonly durationMinutes: number | null;
  readonly category: string;
  readonly rating: number;
  readonly ratingCount: number;
  readonly professionals: number;
  readonly isFeatured: boolean;
};

export type RoadmapCandidateQuery = {
  readonly take: number;
  readonly freeOnly: boolean;
  readonly subjects: readonly string[];
};
