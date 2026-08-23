import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import {
  ContentType,
  LearningBudgetPreference,
  LearningFormat,
  LearningTimeCommitment,
  RoadmapChatRole,
  RoadmapDraftStatus,
  RoadmapDraftStep,
  SkillLevel,
} from "@prisma/client";
import {
  RoadmapDraftFieldKey,
  RoadmapWidgetKind,
} from "@professional/enums/roadmap-draft.enum";
import { ProfessionalGqlObjectNames } from "@professional/enums/gql-names.enum";
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
  @Field(() => ID) id: string;
  @Field() createdAt: Date;
  @Field(() => RoadmapChatRole) role: RoadmapChatRole;
  @Field(() => RoadmapDraftStep) stepKey: RoadmapDraftStep;
  /**
   * Prose for assistant and professional messages. System messages carry a
   * stable message code instead, so the copy stays translatable rather than
   * frozen in whatever locale the turn happened to run in.
   */
  @Field() content: string;
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
  @Field(() => ID) id: string;
  @Field() updatedAt: Date;
  @Field(() => RoadmapDraftStatus) status: RoadmapDraftStatus;
  @Field(() => RoadmapDraftStep) currentStep: RoadmapDraftStep;

  @Field(() => String, { nullable: true }) goal?: string | null;
  @Field(() => String, { nullable: true }) targetRole?: string | null;
  @Field(() => String, { nullable: true }) goalReason?: string | null;
  @Field(() => String, { nullable: true }) context?: string | null;
  @Field(() => Date, { nullable: true }) targetDate?: Date | null;

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
  @Field(() => String, { nullable: true }) certificationName?: string | null;
  @Field(() => Float, { nullable: true }) requiredCredits?: number | null;
  @Field(() => Float, { nullable: true }) completedCredits?: number | null;

  /** The last turn could not be understood; the same question stands. */
  @Field(() => Boolean) needsClarification: boolean;
  /** The last message was off topic and was not treated as an answer. */
  @Field(() => Boolean) wasRefused: boolean;
  /** Derived here from the draft's own fields, never taken from the provider. */
  @Field(() => Boolean) isComplete: boolean;

  /** The control the next answer should be collected with, if any. */
  @Field(() => RoadmapWidgetEntity, { nullable: true })
  widget?: RoadmapWidgetEntity | null;

  /** The subjects this draft may choose from, as offered to the provider. */
  @Field(() => [RoadmapSubjectOptionEntity])
  subjectOptions: RoadmapSubjectOptionEntity[];

  @Field(() => PaginatedRoadmapChatMessagesEntity)
  transcript: PaginatedRoadmapChatMessagesEntity;
}
