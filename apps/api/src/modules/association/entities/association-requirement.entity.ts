import { CPDReminderTiming, CreditType, PDUCategory } from "@prisma/client";
import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { AssociationRequirementStatus } from "@prisma/client";
import { AssociationEvidencePolicy } from "@prisma/client";
import { AssociationGqlObjectNames } from "@association/enums/association-gql-names.enum";
import { AssociationReportingCycle } from "@prisma/client";
import { AssociationPageInfoEntity } from "@association/entities/association-page-info.entity";
import { AssociationAudienceKind } from "@prisma/client";

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_REQUIREMENT_CATEGORY)
export class AssociationRequirementCategoryEntity {
  @Field() name: string;
  @Field(() => ID) id: string;
  @Field(() => Int) order: number;
  @Field(() => Float) requiredCredits: number;
  @Field(() => PDUCategory) mappedCategory: PDUCategory;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_REQUIREMENT_TARGET)
export class AssociationRequirementTargetEntity {
  @Field(() => ID) id: string;
  @Field(() => ID, { nullable: true }) groupId: string | null;
  @Field(() => ID, { nullable: true }) memberId: string | null;
  @Field(() => String, { nullable: true }) label: string | null;
  @Field(() => AssociationAudienceKind) kind: AssociationAudienceKind;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_REQUIREMENT_PROBLEM)
export class AssociationRequirementProblemEntity {
  @Field() code: string;
  @Field() field: string;
  @Field() message: string;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_REQUIREMENT)
export class AssociationRequirementEntity {
  @Field() name: string;
  @Field(() => ID) id: string;
  @Field(() => String, { nullable: true }) description: string | null;
  @Field(() => CreditType) creditType: CreditType;
  @Field(() => Float) totalRequiredCredits: number;
  @Field(() => Date, { nullable: true }) deadline: Date | null;
  @Field(() => AssociationReportingCycle)
  reportingCycle: AssociationReportingCycle;
  @Field(() => Int, { nullable: true }) cycleLengthYears: number | null;
  @Field(() => AssociationEvidencePolicy)
  evidencePolicy: AssociationEvidencePolicy;
  @Field(() => Date, { nullable: true }) reportingStart: Date | null;
  @Field(() => Date, { nullable: true }) reportingEnd: Date | null;
  @Field(() => Date, { nullable: true }) submissionOpensAt: Date | null;
  @Field(() => Date, { nullable: true }) submissionClosesAt: Date | null;
  @Field(() => Int) gracePeriodDays: number;
  @Field() allowLateSubmission: boolean;
  @Field() remindersEnabled: boolean;
  @Field(() => CPDReminderTiming, { nullable: true })
  reminderTiming: CPDReminderTiming | null;
  @Field(() => AssociationAudienceKind) audienceKind: AssociationAudienceKind;
  @Field(() => AssociationRequirementStatus)
  status: AssociationRequirementStatus;
  @Field(() => Date, { nullable: true }) publishedAt: Date | null;
  @Field(() => Date, { nullable: true }) archivedAt: Date | null;
  @Field(() => [AssociationRequirementCategoryEntity])
  categories: AssociationRequirementCategoryEntity[];
  @Field(() => [AssociationRequirementTargetEntity])
  targets: AssociationRequirementTargetEntity[];
  @Field(() => Int) assignedMemberCount: number;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
}

@ObjectType(AssociationGqlObjectNames.PAGINATED_ASSOCIATION_REQUIREMENTS)
export class PaginatedAssociationRequirementsEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => AssociationPageInfoEntity) pageInfo: AssociationPageInfoEntity;
  @Field(() => [AssociationRequirementEntity])
  items: AssociationRequirementEntity[];
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_REQUIREMENT_STATS)
export class AssociationRequirementStatsEntity {
  @Field(() => Int) membersCovered: number;
  @Field(() => Int) draftRequirements: number;
  @Field(() => Int) totalRequirements: number;
  @Field(() => Int) publishedRequirements: number;
}
