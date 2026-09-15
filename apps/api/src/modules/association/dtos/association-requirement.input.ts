import { CPDReminderTiming, CreditType, PDUCategory } from "@prisma/client";
import { ASSOCIATION_REQUIREMENT_LIMITS as LIMITS } from "@loopskey/api-contracts/validation";
import { MaxLength, MinLength, ValidateNested } from "class-validator";
import { ASSOCIATION_GRACE_PERIOD_OPTIONS } from "@loopskey/api-contracts/validation";
import { Field, ID, InputType, Int, Float } from "@nestjs/graphql";
import { IsInt, IsString, Max, Min, IsIn } from "class-validator";
import { AssociationLateSubmissionPolicy } from "@prisma/client";
import { AssociationRequirementStatus } from "@prisma/client";
import { AssociationSubmissionWindow } from "@prisma/client";
import { AssociationRenewalCondition } from "@prisma/client";
import { AssociationEvidencePolicy } from "@prisma/client";
import { IsBoolean, IsDate, IsEnum } from "class-validator";
import { AssociationReportingCycle } from "@prisma/client";
import { AssociationGqlInputNames } from "@association/enums/association-gql-names.enum";
import { AssociationAudienceKind } from "@prisma/client";
import { ArrayMaxSize, IsArray } from "class-validator";
import { IsNumber, IsOptional } from "class-validator";
import { Type } from "class-transformer";

@InputType(AssociationGqlInputNames.ASSOCIATION_REQUIREMENT_ID)
export class AssociationRequirementIdInput {
  @Field(() => ID) @IsString() requirementId!: string;
}

@InputType(AssociationGqlInputNames.ASSOCIATION_REQUIREMENT_FILTER)
export class AssociationRequirementFilterInput {
  @Field(() => AssociationRequirementStatus, { nullable: true })
  @IsOptional()
  @IsEnum(AssociationRequirementStatus)
  status?: AssociationRequirementStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}

@InputType(AssociationGqlInputNames.CREATE_ASSOCIATION_REQUIREMENT_DRAFT)
export class CreateAssociationRequirementDraftInput {
  @Field()
  @IsString()
  @MinLength(LIMITS.nameMin)
  @MaxLength(LIMITS.nameMax)
  name!: string;

  @Field(() => CreditType, { nullable: true })
  @IsOptional()
  @IsEnum(CreditType)
  creditType?: CreditType;
}

@InputType(AssociationGqlInputNames.UPDATE_ASSOCIATION_REQUIREMENT_DETAILS)
export class UpdateAssociationRequirementDetailsInput extends AssociationRequirementIdInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(LIMITS.nameMin)
  @MaxLength(LIMITS.nameMax)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(LIMITS.descriptionMax)
  description?: string;

  @Field(() => CreditType, { nullable: true })
  @IsOptional()
  @IsEnum(CreditType)
  creditType?: CreditType;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(LIMITS.creditsMax)
  totalRequiredCredits?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  deadline?: Date;

  @Field(() => AssociationReportingCycle, { nullable: true })
  @IsOptional()
  @IsEnum(AssociationReportingCycle)
  reportingCycle?: AssociationReportingCycle;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(LIMITS.cycleLengthYearsMax)
  cycleLengthYears?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  remindersEnabled?: boolean;

  @Field(() => CPDReminderTiming, { nullable: true })
  @IsOptional()
  @IsEnum(CPDReminderTiming)
  reminderTiming?: CPDReminderTiming;
}

@InputType(AssociationGqlInputNames.ASSOCIATION_REQUIREMENT_CATEGORY)
export class AssociationRequirementCategoryInput {
  @Field()
  @IsString()
  @MinLength(LIMITS.categoryNameMin)
  @MaxLength(LIMITS.categoryNameMax)
  name!: string;

  @Field(() => PDUCategory)
  @IsEnum(PDUCategory)
  mappedCategory!: PDUCategory;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  @Max(LIMITS.creditsMax)
  requiredCredits!: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

@InputType(AssociationGqlInputNames.UPDATE_ASSOCIATION_REQUIREMENT_CATEGORIES)
export class UpdateAssociationRequirementCategoriesInput extends AssociationRequirementIdInput {
  @Field(() => [AssociationRequirementCategoryInput])
  @IsArray()
  @ArrayMaxSize(LIMITS.categoriesMax)
  @ValidateNested({ each: true })
  @Type(() => AssociationRequirementCategoryInput)
  categories!: AssociationRequirementCategoryInput[];
}

@InputType(
  AssociationGqlInputNames.UPDATE_ASSOCIATION_REQUIREMENT_EVIDENCE_RULES,
)
export class UpdateAssociationRequirementEvidenceRulesInput extends AssociationRequirementIdInput {
  @Field(() => AssociationEvidencePolicy)
  @IsEnum(AssociationEvidencePolicy)
  evidencePolicy!: AssociationEvidencePolicy;
}

@InputType(
  AssociationGqlInputNames.UPDATE_ASSOCIATION_REQUIREMENT_REPORTING_RULES,
)
export class UpdateAssociationRequirementReportingRulesInput extends AssociationRequirementIdInput {
  @Field({ nullable: true }) @IsOptional() @IsDate() reportingStart?: Date;
  @Field({ nullable: true }) @IsOptional() @IsDate() reportingEnd?: Date;

  @Field(() => AssociationSubmissionWindow, { nullable: true })
  @IsOptional()
  @IsEnum(AssociationSubmissionWindow)
  submissionWindow?: AssociationSubmissionWindow;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @IsIn(ASSOCIATION_GRACE_PERIOD_OPTIONS)
  gracePeriodDays?: number;

  @Field(() => AssociationLateSubmissionPolicy, { nullable: true })
  @IsOptional()
  @IsEnum(AssociationLateSubmissionPolicy)
  lateSubmissionPolicy?: AssociationLateSubmissionPolicy;

  @Field(() => AssociationRenewalCondition, { nullable: true })
  @IsOptional()
  @IsEnum(AssociationRenewalCondition)
  renewalCondition?: AssociationRenewalCondition;
}

@InputType(AssociationGqlInputNames.UPDATE_ASSOCIATION_REQUIREMENT_AUDIENCE)
export class UpdateAssociationRequirementAudienceInput extends AssociationRequirementIdInput {
  @Field(() => AssociationAudienceKind)
  @IsEnum(AssociationAudienceKind)
  audienceKind!: AssociationAudienceKind;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(LIMITS.groupsMax)
  @IsString({ each: true })
  groupIds?: string[];

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(LIMITS.specificMembersMax)
  @IsString({ each: true })
  memberIds?: string[];
}
