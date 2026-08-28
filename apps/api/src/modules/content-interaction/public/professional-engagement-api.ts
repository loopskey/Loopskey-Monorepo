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
  roadmapStepCompletionCounts(input: {
    userId: string;
    enrollmentIds: string[];
  }): Promise<Record<string, number>>;

  startRoadmapStep(input: {
    userId: string;
    enrollmentId: string;
    stepId: string;
  }): Promise<Record<string, unknown> | null>;
  completeRoadmapStep(input: {
    userId: string;
    enrollmentId: string;
    stepId: string;
  }): Promise<Record<string, unknown> | null>;
  payments(input: {
    userId: string;
    search?: string;
    cursor?: string;
    take: number;
  }): Promise<Record<string, unknown>>;

  createRoadmapEnrollment(
    input: RoadmapEnrollmentInput,
    unitOfWork: UnitOfWork,
  ): Promise<void>;

  roadmapEnrollmentById(input: {
    userId: string;
    enrollmentId: string;
  }): Promise<RoadmapEnrollmentProjection | null>;
  hasRoadmapEnrollmentForDraft(draftId: string): Promise<boolean>;
  roadmapStepProgress(input: {
    userId: string;
    enrollmentIds: string[];
  }): Promise<RoadmapStepProgressProjection[]>;
  completeRoadmapEnrollment(input: {
    userId: string;
    enrollmentId: string;
  }): Promise<void>;
  reopenRoadmapEnrollment(input: {
    userId: string;
    enrollmentId: string;
  }): Promise<void>;
}

export type UnitOfWork = object;

export type RoadmapEnrollmentInput = {
  readonly userId: string;
  readonly draftId: string;
  readonly roadmapId: string;
  readonly targetDate: Date | null;
};

export type RoadmapStepProgressProjection = {
  readonly stepId: string;
  readonly enrollmentId: string;
  readonly status: string;
  readonly completedAt: Date | null;
};

export type RoadmapEnrollmentProjection = {
  readonly id: string;
  readonly status: string;
  readonly userId: string;
  readonly progress: number;
  readonly roadmapId: string;
  readonly draftId: string | null;
  readonly targetDate: Date | null;
  readonly completedAt: Date | null;
};
