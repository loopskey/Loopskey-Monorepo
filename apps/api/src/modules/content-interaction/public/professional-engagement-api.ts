export const PROFESSIONAL_ENGAGEMENT_API = Symbol(
  "PROFESSIONAL_ENGAGEMENT_API",
);

export interface ProfessionalEngagementApi {
  courseEnrollments(input: {
    userId: string;
    courseIds?: string[];
    cursor?: string;
    take: number;
  }): Promise<{ rows: Record<string, unknown>[]; totalCount: number }>;
  courseCounts(
    userId: string,
  ): Promise<{ active: number; completed: number; total: number }>;
  roadmapEnrollments(input: {
    userId: string;
    roadmapIds?: string[];
    cursor?: string;
    take: number;
  }): Promise<{ rows: Record<string, unknown>[]; totalCount: number }>;
  enrolledRoadmapIds(userId: string): Promise<string[]>;
  payments(input: {
    userId: string;
    search?: string;
    cursor?: string;
    take: number;
  }): Promise<Record<string, unknown>>;
}
