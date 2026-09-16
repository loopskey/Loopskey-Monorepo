import { ArrayMaxSize, IsArray, IsDateString, IsEnum } from "class-validator";
import { IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { CPDEvidenceType, CPDReportRecipientType } from "@prisma/client";
import { Field, Float, ID, InputType } from "@nestjs/graphql";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { MaxLength, ValidateNested } from "class-validator";
import { CpdPlanCategoryInput } from "@professional/dtos/create-cpd-plan.input";
import { Transform, Type } from "class-transformer";
import { trimToNull } from "@utils/transform.util";

@InputType(ProfessionalGqlInputNames.PATCH_ROADMAP_CPD_SETUP_INPUT)
export class PatchRoadmapCpdSetupInput {
  @Field(() => ID)
  @IsString()
  draftId: string;

  @Field(() => ID, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  certificationId?: string | null;

  @Field(() => String, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  certificationName?: string | null;

  @Field(() => String, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  organization?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  reportingStart?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  reportingEnd?: string | null;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  totalRequiredCredits?: number | null;

  @Field(() => [CpdPlanCategoryInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CpdPlanCategoryInput)
  categories?: CpdPlanCategoryInput[] | null;

  @Field(() => [CPDEvidenceType], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(CPDEvidenceType, { each: true })
  @ArrayMaxSize(10)
  evidenceTypes?: CPDEvidenceType[] | null;

  @Field(() => String, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  evidenceOtherNote?: string | null;

  @Field(() => CPDReportRecipientType, { nullable: true })
  @IsOptional()
  @IsEnum(CPDReportRecipientType)
  reportRecipientType?: CPDReportRecipientType | null;

  @Field(() => String, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  reportRecipientLabel?: string | null;
}
