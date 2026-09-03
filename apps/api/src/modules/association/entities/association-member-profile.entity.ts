import { AssociationAssignmentProgressEntity } from "@association/entities/association-compliance.entity";
import { CreditType, PDUCategory, PDUSource } from "@prisma/client";
import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { AssociationAttributionState } from "@prisma/client";
import { AssociationGqlObjectNames } from "@association/enums/association-gql-names.enum";
import { AssociationPageInfoEntity } from "@association/entities/association-page-info.entity";
import { AssociationComplianceBand } from "@prisma/client";
import { AssociationMemberEntity } from "@association/entities/association-member.entity";
import { AssociationAudienceKind } from "@prisma/client";
import { CertificateStatus } from "@prisma/client";

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_EVIDENCE_FILE)
export class AssociationEvidenceFileEntity {
  @Field() fileName: string;
  @Field() mimeType: string;
  @Field(() => ID) id: string;
  @Field(() => Int) sizeBytes: number;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MEMBER_SUMMARY)
export class AssociationMemberSummaryEntity {
  @Field(() => Float) percent: number;
  @Field(() => Float) creditsRequired: number;
  @Field(() => Float) creditsCompleted: number;
  @Field(() => Float) creditsRemaining: number;
  @Field(() => Int) awaitingReviewCount: number;
  @Field(() => Float, { nullable: true }) pacePercent: number | null;
  @Field(() => Date, { nullable: true }) nearestDueDate: Date | null;
  @Field(() => Int, { nullable: true }) nearestDueDays: number | null;
  @Field(() => AssociationComplianceBand) band: AssociationComplianceBand;
  @Field(() => ID, { nullable: true }) nearestRequirementId: string | null;
  @Field(() => String, { nullable: true })
  nearestRequirementName: string | null;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_CUMULATIVE_POINT)
export class AssociationCumulativePointEntity {
  @Field() date: Date;
  @Field(() => Float) credits: number;
  @Field(() => Float) requiredCredits: number;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MEMBER_CERTIFICATE)
export class AssociationMemberCertificateEntity {
  @Field() title: string;
  @Field() issuedAt: Date;
  @Field(() => ID) id: string;
  @Field(() => ID) memberId: string;
  @Field(() => Float) creditsEarned: number;
  @Field(() => CertificateStatus) status: CertificateStatus;
  @Field(() => String, { nullable: true }) issuer: string | null;
  @Field(() => Date, { nullable: true }) validUntil: Date | null;
  @Field(() => [AssociationEvidenceFileEntity])
  files: AssociationEvidenceFileEntity[];
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MEMBER_PROFILE)
export class AssociationMemberProfileEntity {
  @Field() isMissingEvidence: boolean;
  @Field(() => AssociationMemberEntity) member: AssociationMemberEntity;
  @Field(() => AssociationMemberSummaryEntity)
  summary: AssociationMemberSummaryEntity;
  @Field(() => [AssociationAssignmentProgressEntity])
  assignments: AssociationAssignmentProgressEntity[];
  @Field(() => [AssociationCumulativePointEntity])
  cumulative: AssociationCumulativePointEntity[];
  @Field(() => [AssociationMemberCertificateEntity])
  certificates: AssociationMemberCertificateEntity[];
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_ACTIVITY_REQUIREMENT)
export class AssociationActivityRequirementEntity {
  @Field() name: string;
  @Field(() => ID) id: string;
  @Field() canReview: boolean;
  @Field(() => Float) creditedAmount: number;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MEMBER_ACTIVITY)
export class AssociationMemberActivityEntity {
  @Field() date: Date;
  @Field() title: string;
  @Field() isLate: boolean;
  @Field(() => ID) id: string;
  @Field() canReview: boolean;
  @Field() hasEvidence: boolean;
  @Field(() => ID) memberId: string;
  @Field(() => Float) credits: number;
  @Field(() => PDUSource) source: PDUSource;
  @Field(() => CreditType) creditType: CreditType;
  @Field(() => PDUCategory) category: PDUCategory;
  @Field(() => String, { nullable: true }) reviewNote: string | null;
  @Field(() => String, { nullable: true }) evidenceUrl: string | null;
  @Field(() => String, { nullable: true }) evidenceNote: string | null;
  @Field(() => AssociationAttributionState) state: AssociationAttributionState;
  @Field(() => [AssociationEvidenceFileEntity])
  files: AssociationEvidenceFileEntity[];
  @Field(() => [AssociationActivityRequirementEntity])
  requirements: AssociationActivityRequirementEntity[];
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_ACTIVITY_COUNTS)
export class AssociationActivityCountsEntity {
  @Field(() => Int) counted: number;
  @Field(() => Int) rejected: number;
  @Field(() => Int) awaitingReview: number;
}

@ObjectType(AssociationGqlObjectNames.PAGINATED_ASSOCIATION_MEMBER_ACTIVITIES)
export class PaginatedAssociationMemberActivitiesEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => AssociationActivityCountsEntity)
  counts: AssociationActivityCountsEntity;
  @Field(() => AssociationPageInfoEntity) pageInfo: AssociationPageInfoEntity;
  @Field(() => [AssociationMemberActivityEntity])
  items: AssociationMemberActivityEntity[];
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MEMBER_REQUIREMENT_OPTION)
export class AssociationMemberRequirementOptionEntity {
  @Field() name: string;
  @Field(() => ID) id: string;
  @Field() isAssigned: boolean;
  @Field() isMemberManaged: boolean;
  @Field(() => CreditType) creditType: CreditType;
  @Field(() => Float) totalRequiredCredits: number;
  @Field(() => Date, { nullable: true }) deadline: Date | null;
  @Field(() => AssociationAudienceKind) audienceKind: AssociationAudienceKind;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MEMBER_REQUIREMENTS_RESULT)
export class AssociationMemberRequirementsResultEntity {
  @Field(() => Int) added: number;
  @Field(() => Int) removed: number;
  @Field(() => ID) memberId: string;
}
