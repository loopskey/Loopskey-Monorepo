import { ContentType, CourseCategory, CourseLevel } from "@prisma/client";
import { RoadmapEnrollmentStatus, RoadmapStatus } from "@prisma/client";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { ProfessionalGqlObjectNames } from "@professional/enums/gql-names.enum";
import { PageInfoEntity } from "@professional/entities/page-info.entity";

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_ROADMAP_STEP)
export class ProfessionalRoadmapStepEntity {
  @Field() title: string;
  @Field(() => ID) id: string;
  @Field(() => Int) order: number;
  @Field(() => String, { nullable: true }) contentId?: string | null;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => ContentType, { nullable: true })
  contentType?: ContentType | null;
}

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_ROADMAP_PHASE)
export class ProfessionalRoadmapPhaseEntity {
  @Field() title: string;
  @Field(() => ID) id: string;
  @Field(() => Int) order: number;
  @Field(() => Int) progress: number;
  @Field(() => Int) stepsCount: number;
  @Field(() => Boolean) completed: boolean;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => [ProfessionalRoadmapStepEntity])
  steps: ProfessionalRoadmapStepEntity[];
}

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_ROADMAP)
export class ProfessionalRoadmapEntity {
  @Field() slug: string;
  @Field() title: string;
  @Field() updatedAt: Date;
  @Field() enrolledAt: Date;
  @Field(() => ID) id: string;
  @Field() description: string;
  @Field(() => ID) userId: string;
  @Field(() => ID) roadmapId: string;
  @Field(() => Int) progress: number;
  @Field(() => Int) totalSteps: number;
  @Field(() => Int) phasesCount: number;
  @Field(() => Int) completedSteps: number;
  @Field(() => Int) completedPhases: number;
  @Field(() => CourseLevel) level: CourseLevel;
  @Field(() => Int) nextMilestoneProgress: number;
  @Field(() => RoadmapStatus) roadmapStatus: RoadmapStatus;
  @Field(() => Date, { nullable: true }) completedAt?: Date | null;
  @Field(() => String, { nullable: true }) imageUrl?: string | null;
  @Field(() => RoadmapEnrollmentStatus) status: RoadmapEnrollmentStatus;
  @Field(() => String, { nullable: true }) nextPhaseTitle?: string | null;
  @Field(() => CourseCategory, { nullable: true })
  category?: CourseCategory | null;
  @Field(() => [ProfessionalRoadmapPhaseEntity])
  phases: ProfessionalRoadmapPhaseEntity[];
}

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_EXPLORE_ROADMAP)
export class ProfessionalExploreRoadmapEntity {
  @Field() slug: string;
  @Field() title: string;
  @Field(() => ID) id: string;
  @Field() description: string;
  @Field(() => Int) totalSteps: number;
  @Field(() => Int) phasesCount: number;
  @Field(() => Int) estimatedWeeks: number;
  @Field(() => Boolean) isEnrolled: boolean;
  @Field(() => CourseLevel) level: CourseLevel;
  @Field(() => RoadmapStatus) status: RoadmapStatus;
  @Field(() => String, { nullable: true }) imageUrl?: string | null;
  @Field(() => CourseCategory, { nullable: true })
  category?: CourseCategory | null;
}

@ObjectType(ProfessionalGqlObjectNames.PAGINATED_PROFESSIONAL_ROADMAPS)
export class PaginatedProfessionalRoadmapsEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => PageInfoEntity) pageInfo: PageInfoEntity;
  @Field(() => [ProfessionalRoadmapEntity]) items: ProfessionalRoadmapEntity[];
}

@ObjectType(ProfessionalGqlObjectNames.PAGINATED_PROFESSIONAL_EXPLORE_ROADMAPS)
export class PaginatedProfessionalExploreRoadmapsEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => PageInfoEntity) pageInfo: PageInfoEntity;
  @Field(() => [ProfessionalExploreRoadmapEntity])
  items: ProfessionalExploreRoadmapEntity[];
}
