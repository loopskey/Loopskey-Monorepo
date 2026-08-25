import { ContentType, RoadmapDraftStep, SkillLevel } from "@prisma/client";
import { LearningTimeCommitment, LearningFormat } from "@prisma/client";
import { RoadmapChatRole, RoadmapDraftStatus } from "@prisma/client";
import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { ProfessionalGqlObjectNames } from "@professional/enums/gql-names.enum";
import { LearningBudgetPreference } from "@prisma/client";
import { RoadmapDraftFieldKey } from "@professional/enums/roadmap-draft.enum";
import { RoadmapWidgetKind } from "@professional/enums/roadmap-draft.enum";
import { PageInfoEntity } from "@professional/entities/page-info.entity";

@ObjectType(ProfessionalGqlObjectNames.ROADMAP_WIDGET_OPTION)
export class RoadmapWidgetOptionEntity {
  @Field() value: string;
  @Field() label: string;
}

@ObjectType(ProfessionalGqlObjectNames.ROADMAP_WIDGET)
export class RoadmapWidgetEntity {
  @Field(() => RoadmapWidgetKind) type: RoadmapWidgetKind;
  @Field(() => RoadmapDraftFieldKey) field: RoadmapDraftFieldKey;
  @Field(() => Int, { nullable: true }) maxSelections?: number | null;
  @Field(() => [RoadmapWidgetOptionEntity])
  options: RoadmapWidgetOptionEntity[];
}

@ObjectType(ProfessionalGqlObjectNames.ROADMAP_SUBJECT_OPTION)
export class RoadmapSubjectOptionEntity {
  @Field(() => ID) id: string;
  @Field() label: string;
}

@ObjectType(ProfessionalGqlObjectNames.ROADMAP_CHAT_MESSAGE)
export class RoadmapChatMessageEntity {
  @Field() content: string;
  @Field() createdAt: Date;
  @Field(() => ID) id: string;
  @Field(() => RoadmapChatRole) role: RoadmapChatRole;
  @Field(() => RoadmapDraftStep) stepKey: RoadmapDraftStep;
  @Field(() => RoadmapWidgetEntity, { nullable: true })
  widget?: RoadmapWidgetEntity | null;
}

@ObjectType(ProfessionalGqlObjectNames.PAGINATED_ROADMAP_CHAT_MESSAGES)
export class PaginatedRoadmapChatMessagesEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => PageInfoEntity) pageInfo: PageInfoEntity;
  @Field(() => [RoadmapChatMessageEntity])
  items: RoadmapChatMessageEntity[];
}

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_ROADMAP_DRAFT)
export class ProfessionalRoadmapDraftEntity {
  @Field() updatedAt: Date;
  @Field(() => ID) id: string;
  @Field(() => RoadmapDraftStatus) status: RoadmapDraftStatus;
  @Field(() => RoadmapDraftStep) currentStep: RoadmapDraftStep;
  @Field(() => String, { nullable: true }) goal?: string | null;
  @Field(() => Date, { nullable: true }) targetDate?: Date | null;
  @Field(() => String, { nullable: true }) context?: string | null;
  @Field(() => String, { nullable: true }) targetRole?: string | null;
  @Field(() => String, { nullable: true }) goalReason?: string | null;
  @Field(() => String, { nullable: true }) failureReason: string | null;
  @Field(() => SkillLevel, { nullable: true }) skillLevel?: SkillLevel | null;
  @Field(() => LearningTimeCommitment, { nullable: true })
  timeCommitment?: LearningTimeCommitment | null;
  @Field(() => LearningBudgetPreference, { nullable: true })
  budgetPreference?: LearningBudgetPreference | null;
  @Field(() => [String]) subjects: string[];
  @Field(() => [LearningFormat]) preferredFormats: LearningFormat[];
  @Field(() => [ContentType]) preferredContentTypes: ContentType[];

  @Field(() => Boolean) cpdEnabled: boolean;
  @Field(() => ID, { nullable: true }) certificationId?: string | null;
  @Field(() => Float, { nullable: true }) requiredCredits?: number | null;
  @Field(() => Float, { nullable: true }) completedCredits?: number | null;
  @Field(() => String, { nullable: true }) certificationName?: string | null;

  @Field(() => Boolean) wasRefused: boolean;
  @Field(() => Boolean) isComplete: boolean;
  @Field(() => Boolean) needsClarification: boolean;

  @Field(() => RoadmapWidgetEntity, { nullable: true })
  widget?: RoadmapWidgetEntity | null;

  @Field(() => [RoadmapSubjectOptionEntity])
  subjectOptions: RoadmapSubjectOptionEntity[];

  @Field(() => PaginatedRoadmapChatMessagesEntity)
  transcript: PaginatedRoadmapChatMessagesEntity;
}
