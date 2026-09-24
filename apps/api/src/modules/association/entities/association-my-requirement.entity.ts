import { ContentType, CreditType, PDUCategory } from "@prisma/client";
import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { AssociationCategoryProgressEntity } from "@association/entities/association-compliance.entity";
import { AssociationAttributionState } from "@prisma/client";
import { AssociationGqlObjectNames } from "@association/enums/association-gql-names.enum";
import { AssociationComplianceBand } from "@prisma/client";
import { AssociationEvidencePolicy } from "@prisma/client";

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MY_REQUIREMENT)
export class AssociationMyRequirementEntity {
  @Field() name: string;
  @Field() cycleStart: Date;
  @Field() associationName: string;
  @Field(() => Float) percent: number;
  @Field() isMissingEvidence: boolean;
  @Field(() => ID) assignmentId: string;
  @Field(() => ID) requirementId: string;
  @Field(() => ID) associationId: string;
  @Field(() => Float) requiredCredits: number;
  @Field(() => Float) completedCredits: number;
  @Field(() => Float) remainingCredits: number;
  @Field(() => Int) awaitingReviewCount: number;
  @Field(() => CreditType) creditType: CreditType;
  @Field(() => Date, { nullable: true }) dueDate: Date | null;
  @Field(() => Date, { nullable: true }) cycleEnd: Date | null;
  @Field(() => Int, { nullable: true }) daysRemaining: number | null;
  @Field(() => String, { nullable: true }) description: string | null;
  @Field(() => AssociationComplianceBand) band: AssociationComplianceBand;
  @Field(() => AssociationEvidencePolicy)
  evidencePolicy: AssociationEvidencePolicy;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MY_REQUIREMENT_ACTIVITY)
export class AssociationMyRequirementActivityEntity {
  @Field() date: Date;
  @Field() title: string;
  @Field() isLate: boolean;
  @Field() category: string;
  @Field() hasEvidence: boolean;
  @Field(() => ID) activityId: string;
  @Field(() => Float) credits: number;
  @Field(() => Float) creditedAmount: number;
  @Field(() => String, { nullable: true }) reviewNote: string | null;
  @Field(() => String, { nullable: true }) categoryName: string | null;
  @Field(() => AssociationAttributionState) state: AssociationAttributionState;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MY_REQUIREMENT_CONTENT)
export class AssociationMyRequirementContentEntity {
  @Field() title: string;
  @Field(() => ID) id: string;
  @Field() isExternal: boolean;
  @Field() isAvailable: boolean;
  @Field() isCompleted: boolean;
  @Field(() => String, { nullable: true }) slug: string | null;
  @Field(() => ID, { nullable: true }) contentId: string | null;
  @Field(() => String, { nullable: true }) provider: string | null;
  @Field(() => String, { nullable: true }) imageUrl: string | null;
  @Field(() => String, { nullable: true }) externalUrl: string | null;
  @Field(() => String, { nullable: true }) description: string | null;
  @Field(() => Float, { nullable: true }) indicativeCredits: number | null;
  @Field(() => PDUCategory, { nullable: true }) category: PDUCategory | null;
  @Field(() => ContentType, { nullable: true }) contentType: ContentType | null;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MY_REQUIREMENT_DETAIL)
export class AssociationMyRequirementDetailEntity extends AssociationMyRequirementEntity {
  @Field(() => [AssociationCategoryProgressEntity])
  categories: AssociationCategoryProgressEntity[];
  @Field(() => [AssociationMyRequirementActivityEntity])
  activities: AssociationMyRequirementActivityEntity[];
  @Field(() => [AssociationMyRequirementContentEntity])
  learningContents: AssociationMyRequirementContentEntity[];
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_CONTENT_ENDORSEMENT)
export class AssociationContentEndorsementEntity {
  @Field() associationName: string;
  @Field() isDefaultRequirement: boolean;
  @Field(() => ID) requirementId: string;
  @Field(() => ID) learningContentId: string;
}
