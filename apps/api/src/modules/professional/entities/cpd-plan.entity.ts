import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { ProfessionalGqlObjectNames } from "@professional/enums/gql-names.enum";
import {
  CreditType,
  CPDPlanStatus,
  LearningFormat,
  CPDEvidenceType,
  CPDReminderTiming,
  CPDReportRecipientType,
  LearningTimeCommitment,
} from "@prisma/client";

@ObjectType(ProfessionalGqlObjectNames.CPD_PLAN_CATEGORY)
export class CpdPlanCategoryEntity {
  @Field() name: string;
  @Field(() => ID) id: string;
  @Field(() => Int) order: number;
  @Field(() => Float) targetCredits: number;
  @Field(() => Float) completedCredits: number;
}

@ObjectType(ProfessionalGqlObjectNames.CPD_PLAN)
export class CpdPlanEntity {
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field(() => ID) id: string;
  @Field() reportingEnd: Date;
  @Field() reportingStart: Date;
  @Field() organization: string;
  @Field() certificationName: string;
  @Field(() => CreditType) creditType: CreditType;
  @Field(() => Boolean) remindersEnabled: boolean;
  @Field(() => Float) totalRequiredCredits: number;
  @Field(() => CPDPlanStatus) status: CPDPlanStatus;
  @Field(() => Float) initialCompletedCredits: number;
  @Field(() => [CPDEvidenceType]) evidenceTypes: CPDEvidenceType[];
  @Field(() => [LearningFormat]) preferredFormats: LearningFormat[];
  @Field(() => ID, { nullable: true }) certificationId?: string | null;
  @Field(() => [CpdPlanCategoryEntity]) categories: CpdPlanCategoryEntity[];
  @Field(() => String, { nullable: true }) evidenceOtherNote?: string | null;
  @Field(() => String, { nullable: true }) reportRecipientLabel?: string | null;
  @Field(() => LearningTimeCommitment, { nullable: true })
  timeAvailable?: LearningTimeCommitment | null;
  @Field(() => CPDReportRecipientType)
  reportRecipientType: CPDReportRecipientType;
  @Field(() => CPDReminderTiming, { nullable: true })
  reminderTiming?: CPDReminderTiming | null;
}

@ObjectType(ProfessionalGqlObjectNames.CPD_CATEGORY_PROGRESS)
export class CpdCategoryProgressEntity {
  @Field(() => ID) id: string;
  @Field() name: string;
  @Field(() => Float) target: number;
  @Field(() => Float) completed: number;
  @Field(() => Float) remaining: number;
  @Field(() => Float) progress: number;
  @Field(() => Boolean) isComplete: boolean;
}

@ObjectType(ProfessionalGqlObjectNames.CPD_MISSING_REQUIREMENT)
export class CpdMissingRequirementEntity {
  @Field() code: string;
  @Field(() => String, { nullable: true }) detail?: string | null;
}

@ObjectType(ProfessionalGqlObjectNames.CPD_PLAN_PROGRESS)
export class CpdPlanProgressEntity {
  @Field(() => ID) planId: string;
  @Field() complianceStatus: string;
  @Field(() => Float) earnedCredits: number;
  @Field(() => Int) evidenceMissing: number;
  @Field(() => Float) activityCredits: number;
  @Field(() => Float) progressPercent: number;
  @Field(() => Int) categoriesMissing: number;
  @Field(() => Int) activitiesCounted: number;
  @Field(() => Float) remainingCredits: number;
  @Field(() => Boolean) reportingExpired: boolean;
  @Field(() => Float) totalRequiredCredits: number;
  @Field(() => Float) initialCompletedCredits: number;
  @Field(() => Boolean) reportingNotStarted: boolean;
  @Field(() => [CpdCategoryProgressEntity])
  categories: CpdCategoryProgressEntity[];
  @Field(() => [CpdMissingRequirementEntity])
  missingRequirements: CpdMissingRequirementEntity[];
}

@ObjectType(ProfessionalGqlObjectNames.CPD_REPORT_RECIPIENT_OPTION)
export class CpdReportRecipientOptionEntity {
  @Field() label: string;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => CPDReportRecipientType) type: CPDReportRecipientType;
}
