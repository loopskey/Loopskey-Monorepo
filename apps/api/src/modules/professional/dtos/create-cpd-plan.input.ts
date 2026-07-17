import { Field, Float, ID, InputType } from "@nestjs/graphql";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import {
  CPDEvidenceType,
  CPDReminderTiming,
  CPDReportRecipientType,
  CreditType,
  LearningFormat,
  LearningTimeCommitment,
} from "@prisma/client";

@InputType(ProfessionalGqlInputNames.CPD_PLAN_CATEGORY_INPUT)
export class CpdPlanCategoryInput {
  @Field() @IsString() @MaxLength(160) name: string;
  @Field(() => Float) @IsNumber() @Min(0) target: number;

  @Field(() => Float, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  completed?: number;
}

@InputType(ProfessionalGqlInputNames.CREATE_CPD_PLAN_INPUT)
export class CreateCpdPlanInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  certificationId?: string;

  @Field() @IsString() @MaxLength(200) certificationName: string;
  @Field() @IsString() @MaxLength(200) organization: string;

  @Field() @IsDateString() reportingStart: string;
  @Field() @IsDateString() reportingEnd: string;

  @Field(() => CreditType) @IsEnum(CreditType) creditType: CreditType;

  @Field(() => Float) @IsNumber() @IsPositive() totalRequiredCredits: number;

  @Field(() => Float, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  initialCompletedCredits?: number;

  @Field(() => LearningTimeCommitment, { nullable: true })
  @IsOptional()
  @IsEnum(LearningTimeCommitment)
  timeAvailable?: LearningTimeCommitment;

  @Field(() => [LearningFormat], { nullable: true, defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsEnum(LearningFormat, { each: true })
  preferredFormats?: LearningFormat[];

  @Field(() => [CPDEvidenceType])
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(CPDEvidenceType, { each: true })
  evidenceTypes: CPDEvidenceType[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  evidenceOtherNote?: string;

  @Field(() => CPDReportRecipientType)
  @IsEnum(CPDReportRecipientType)
  reportRecipientType: CPDReportRecipientType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  reportRecipientLabel?: string;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  remindersEnabled?: boolean;

  @Field(() => CPDReminderTiming, { nullable: true })
  @IsOptional()
  @IsEnum(CPDReminderTiming)
  reminderTiming?: CPDReminderTiming;

  @Field(() => [CpdPlanCategoryInput], { nullable: true, defaultValue: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CpdPlanCategoryInput)
  categories?: CpdPlanCategoryInput[];

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  allowDuplicate?: boolean;
}
