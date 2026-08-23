import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import {
  ContentType,
  LearningBudgetPreference,
  LearningFormat,
  LearningTimeCommitment,
  SkillLevel,
} from "@prisma/client";
import { SERVICE_AI_LIMITS } from "@infrastructure/service-ai/service-ai.port";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { Field, Float, ID, InputType } from "@nestjs/graphql";
import { trimToNull } from "@utils/transform.util";
import { Transform } from "class-transformer";

/**
 * The largest credit figure the provider's decimal rule accepts. Checked here
 * so a manually entered requirement fails as a validation message rather than
 * at the edge of the AI call.
 */
const MAX_CREDITS = 999_999.99;

/**
 * Every collected field, all optional: the mutation carries exactly one of
 * them and the service rejects any other count. An explicit null clears the
 * field; leaving it out means the patch does not speak about it, which is the
 * same distinction the chat turn draws.
 */
@InputType(ProfessionalGqlInputNames.PATCH_ROADMAP_DRAFT_INPUT)
export class PatchRoadmapDraftInput {
  @Field(() => ID)
  @IsString()
  draftId: string;

  @Field(() => String, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(SERVICE_AI_LIMITS.goalMaxLength)
  goal?: string | null;

  @Field(() => String, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(SERVICE_AI_LIMITS.targetRoleMaxLength)
  targetRole?: string | null;

  @Field(() => String, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(SERVICE_AI_LIMITS.goalReasonMaxLength)
  goalReason?: string | null;

  @Field(() => String, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(SERVICE_AI_LIMITS.contextMaxLength)
  context?: string | null;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  targetDate?: Date | null;

  @Field(() => SkillLevel, { nullable: true })
  @IsOptional()
  @IsEnum(SkillLevel)
  skillLevel?: SkillLevel | null;

  @Field(() => LearningTimeCommitment, { nullable: true })
  @IsOptional()
  @IsEnum(LearningTimeCommitment)
  timeCommitment?: LearningTimeCommitment | null;

  @Field(() => LearningBudgetPreference, { nullable: true })
  @IsOptional()
  @IsEnum(LearningBudgetPreference)
  budgetPreference?: LearningBudgetPreference | null;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(SERVICE_AI_LIMITS.subjectsMaxItems)
  @IsString({ each: true })
  subjects?: string[] | null;

  @Field(() => [LearningFormat], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(SERVICE_AI_LIMITS.formatsMaxItems)
  @IsEnum(LearningFormat, { each: true })
  preferredFormats?: LearningFormat[] | null;

  @Field(() => [ContentType], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(SERVICE_AI_LIMITS.contentTypesMaxItems)
  @IsEnum(ContentType, { each: true })
  preferredContentTypes?: ContentType[] | null;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  cpdEnabled?: boolean | null;

  @Field(() => ID, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  certificationId?: string | null;

  @Field(() => String, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(SERVICE_AI_LIMITS.certificationNameMaxLength)
  certificationName?: string | null;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_CREDITS)
  requiredCredits?: number | null;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_CREDITS)
  completedCredits?: number | null;
}
