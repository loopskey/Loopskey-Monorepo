import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { AssociationGqlObjectNames } from "@association/enums/association-gql-names.enum";
import { AssociationPageInfoEntity } from "@association/entities/association-page-info.entity";
import { AssociationComplianceBand } from "@prisma/client";
import { PDUCategory } from "@prisma/client";

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_REPORT_SUMMARY)
export class AssociationReportSummaryEntity {
  @Field() periodEnd: Date;
  @Field() periodStart: Date;
  @Field(() => Int) atRisk: number;
  @Field(() => Int) onTrack: number;
  @Field(() => Int) renewalReady: number;
  @Field(() => Int) atRiskChange: number;
  @Field(() => Int) totalMembers: number;
  @Field(() => Float) atRiskShare: number;
  @Field(() => Int) onTrackChange: number;
  @Field(() => Float) onTrackShare: number;
  @Field(() => Int) missingEvidence: number;
  @Field(() => Int) renewalReadyChange: number;
  @Field(() => Int) totalMembersChange: number;
  @Field(() => Float) averageCompletion: number;
  @Field(() => Float) renewalReadyShare: number;
  @Field(() => Int) missingEvidenceChange: number;
  @Field(() => Float) missingEvidenceShare: number;
  @Field(() => Date, { nullable: true }) computedAt: Date | null;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_GROUP_COMPLIANCE)
export class AssociationGroupComplianceEntity {
  @Field(() => Int) atRisk: number;
  @Field(() => Int) onTrack: number;
  @Field(() => Int) notStarted: number;
  @Field(() => Int) memberCount: number;
  @Field(() => Int) renewalReady: number;
  @Field(() => Float) averageCompletion: number;
  @Field(() => ID, { nullable: true }) groupId: string | null;
  @Field(() => String, { nullable: true }) groupTitle: string | null;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_CATEGORY_PROGRESS_ROW)
export class AssociationCategoryProgressRowEntity {
  @Field() categoryName: string;
  @Field() requirementName: string;
  @Field(() => ID) categoryId: string;
  @Field(() => Int) behindCount: number;
  @Field(() => Int) memberCount: number;
  @Field(() => Int) atRiskCount: number;
  @Field(() => ID) requirementId: string;
  @Field(() => Int) onTrackCount: number;
  @Field(() => Int) belowHalfCount: number;
  @Field(() => Float) averagePercent: number;
  @Field(() => Float) requiredCredits: number;
  @Field(() => Float) averageCompletedCredits: number;
  @Field(() => PDUCategory) mappedCategory: PDUCategory;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MEMBER_DISTRIBUTION)
export class AssociationMemberDistributionEntity {
  @Field(() => Int) atRisk: number;
  @Field(() => Int) onTrack: number;
  @Field(() => Int) notStarted: number;
  @Field(() => Int) renewalReady: number;
  @Field(() => Int) totalMembers: number;
  @Field(() => Float) atRiskShare: number;
  @Field(() => Float) onTrackShare: number;
  @Field(() => Float) notStartedShare: number;
  @Field(() => Float) renewalReadyShare: number;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_COMPLIANCE_TREND_POINT)
export class AssociationComplianceTrendPointEntity {
  @Field() at: Date;
  @Field(() => Int) atRisk: number;
  @Field(() => Int) onTrack: number;
  @Field(() => Int) notStarted: number;
  @Field(() => Int) totalMembers: number;
  @Field(() => Int) renewalReady: number;
  @Field(() => Float) atRiskShare: number;
  @Field(() => Float) onTrackShare: number;
  @Field(() => Float) notStartedShare: number;
  @Field(() => Float) renewalReadyShare: number;
  @Field(() => Float) averageCompletion: number;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_REPORT_ASSIGNMENT)
export class AssociationReportAssignmentEntity {
  @Field() requirementName: string;
  @Field(() => Float) percent: number;
  @Field() isMissingEvidence: boolean;
  @Field(() => ID) assignmentId: string;
  @Field(() => ID) requirementId: string;
  @Field(() => Float) requiredCredits: number;
  @Field(() => Float) completedCredits: number;
  @Field(() => Int) awaitingReviewCount: number;
  @Field(() => Date, { nullable: true }) dueDate: Date | null;
  @Field(() => Int, { nullable: true }) daysRemaining: number | null;
  @Field(() => AssociationComplianceBand) band: AssociationComplianceBand;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MEMBER_PROGRESS_ROW)
export class AssociationMemberProgressRowEntity {
  @Field() hasStarted: boolean;
  @Field(() => ID) memberId: string;
  @Field() isMissingEvidence: boolean;
  @Field(() => Float) percent: number;
  @Field(() => Float) requiredCredits: number;
  @Field(() => Float) completedCredits: number;
  @Field(() => Int) awaitingReviewCount: number;
  @Field(() => String, { nullable: true }) email: string | null;
  @Field(() => String, { nullable: true }) fullName: string | null;
  @Field(() => String, { nullable: true }) groupTitle: string | null;
  @Field(() => String, { nullable: true }) memberNumber: string | null;
  @Field(() => AssociationComplianceBand) band: AssociationComplianceBand;
  @Field(() => Date, { nullable: true }) earliestUnmetDeadline: Date | null;
  @Field(() => [AssociationReportAssignmentEntity])
  assignments: AssociationReportAssignmentEntity[];
}

@ObjectType(AssociationGqlObjectNames.PAGINATED_ASSOCIATION_MEMBER_PROGRESS)
export class PaginatedAssociationMemberProgressEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => AssociationPageInfoEntity) pageInfo: AssociationPageInfoEntity;
  @Field(() => [AssociationMemberProgressRowEntity])
  items: AssociationMemberProgressRowEntity[];
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_GROUP_PROGRESS_ROW)
export class AssociationGroupProgressRowEntity {
  @Field(() => Int) atRisk: number;
  @Field(() => Int) onTrack: number;
  @Field(() => Int) notStarted: number;
  @Field(() => Int) memberCount: number;
  @Field(() => Int) renewalReady: number;
  @Field(() => Int) notStartedCount: number;
  @Field(() => Float) averageCompletion: number;
  @Field(() => Int) missingEvidenceCount: number;
  @Field(() => ID, { nullable: true }) groupId: string | null;
  @Field(() => String, { nullable: true }) groupTitle: string | null;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MISSING_EVIDENCE_ROW)
export class AssociationMissingEvidenceRowEntity {
  @Field(() => ID) id: string;
  @Field() requirementName: string;
  @Field(() => ID) memberId: string;
  @Field(() => Float) percent: number;
  @Field(() => ID) requirementId: string;
  @Field(() => Float) requiredCredits: number;
  @Field(() => Float) completedCredits: number;
  @Field(() => Int) awaitingReviewCount: number;
  @Field(() => Date, { nullable: true }) dueDate: Date | null;
  @Field(() => String, { nullable: true }) email: string | null;
  @Field(() => String, { nullable: true }) fullName: string | null;
  @Field(() => String, { nullable: true }) groupTitle: string | null;
  @Field(() => Int, { nullable: true }) daysRemaining: number | null;
  @Field(() => String, { nullable: true }) memberNumber: string | null;
}

@ObjectType(AssociationGqlObjectNames.PAGINATED_ASSOCIATION_MISSING_EVIDENCE)
export class PaginatedAssociationMissingEvidenceEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => AssociationPageInfoEntity) pageInfo: AssociationPageInfoEntity;
  @Field(() => [AssociationMissingEvidenceRowEntity])
  items: AssociationMissingEvidenceRowEntity[];
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_RENEWAL_READINESS_ROW)
export class AssociationRenewalReadinessRowEntity {
  @Field(() => ID) id: string;
  @Field() isRenewalReady: boolean;
  @Field(() => ID) memberId: string;
  @Field(() => Float) percent: number;
  @Field(() => Float) requiredCredits: number;
  @Field(() => Float) completedCredits: number;
  @Field(() => Int) awaitingReviewCount: number;
  @Field(() => String, { nullable: true }) email: string | null;
  @Field(() => String, { nullable: true }) fullName: string | null;
  @Field(() => String, { nullable: true }) groupTitle: string | null;
  @Field(() => String, { nullable: true }) memberNumber: string | null;
  @Field(() => AssociationComplianceBand) band: AssociationComplianceBand;
  @Field(() => Date, { nullable: true }) earliestUnmetDeadline: Date | null;
}

@ObjectType(AssociationGqlObjectNames.PAGINATED_ASSOCIATION_RENEWAL_READINESS)
export class PaginatedAssociationRenewalReadinessEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => AssociationPageInfoEntity) pageInfo: AssociationPageInfoEntity;
  @Field(() => [AssociationRenewalReadinessRowEntity])
  items: AssociationRenewalReadinessRowEntity[];
}
