import { AssociationGqlObjectNames } from "@association/enums/association-gql-names.enum";
import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { AssociationComplianceBand } from "@prisma/client";
import { CreditType, PDUCategory } from "@prisma/client";

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_CATEGORY_PROGRESS)
export class AssociationCategoryProgressEntity {
  @Field() name: string;
  @Field(() => ID) id: string;
  @Field(() => Float) percent: number;
  @Field(() => Float) requiredCredits: number;
  @Field(() => Float) completedCredits: number;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_ASSIGNMENT_PROGRESS)
export class AssociationAssignmentProgressEntity {
  @Field(() => ID) id: string;
  @Field() requirementName: string;
  @Field() isMissingEvidence: boolean;
  @Field(() => Float) percent: number;
  @Field(() => ID) requirementId: string;
  @Field(() => Float) requiredCredits: number;
  @Field(() => Float) completedCredits: number;
  @Field(() => Int) awaitingReviewCount: number;
  @Field(() => CreditType) creditType: CreditType;
  @Field(() => Date, { nullable: true }) dueDate: Date | null;
  @Field(() => Date, { nullable: true }) computedAt: Date | null;
  @Field(() => Int, { nullable: true }) daysRemaining: number | null;
  @Field(() => AssociationComplianceBand) band: AssociationComplianceBand;
  @Field(() => [AssociationCategoryProgressEntity])
  categories: AssociationCategoryProgressEntity[];
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MEMBER_COMPLIANCE)
export class AssociationMemberComplianceEntity {
  @Field(() => ID) memberId: string;
  @Field() isMissingEvidence: boolean;
  @Field(() => [AssociationAssignmentProgressEntity])
  assignments: AssociationAssignmentProgressEntity[];
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_COMPLIANCE_SUMMARY)
export class AssociationComplianceSummaryEntity {
  @Field(() => ID) memberId: string;
  @Field(() => Float) percent: number;
  @Field() isMissingEvidence: boolean;
  @Field(() => Int) awaitingReviewCount: number;
  @Field(() => Date, { nullable: true }) computedAt: Date | null;
  @Field(() => AssociationComplianceBand) band: AssociationComplianceBand;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_PENDING_REVIEW)
export class AssociationPendingReviewEntity {
  @Field(() => ID) id: string;
  @Field() activityDate: Date;
  @Field() activityTitle: string;
  @Field() requirementName: string;
  @Field(() => ID) memberId: string;
  @Field(() => Float) credits: number;
  @Field(() => ID) activityId: string;
  @Field(() => ID) requirementId: string;
  @Field(() => PDUCategory) category: PDUCategory;
  @Field(() => String, { nullable: true }) memberName: string | null;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_REVIEW_RESULT)
export class AssociationReviewResultEntity {
  @Field() approved: boolean;
  @Field(() => ID) memberId: string;
  @Field(() => ID) activityId: string;
  @Field(() => ID) requirementId: string;
}
