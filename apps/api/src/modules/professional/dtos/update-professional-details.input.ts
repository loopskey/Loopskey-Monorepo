import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { CURRENT_ROLE_MAX_LENGTH } from "@professional/enums/profile-section.enum";
import { ExperienceRange, ProfessionalIndustry } from "@prisma/client";
import { PROFESSIONAL_SUMMARY_MAX_LENGTH } from "@professional/enums/profile-section.enum";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { ProfessionalGoal } from "@prisma/client";
import { Field, ID, InputType } from "@nestjs/graphql";
import { trimToNull } from "@utils/transform.util";
import { Transform } from "class-transformer";

@InputType(ProfessionalGqlInputNames.UPDATE_PROFESSIONAL_DETAILS_INPUT)
export class UpdateProfessionalDetailsInput {
  @Field(() => String, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  profession?: string | null;

  @Field(() => ProfessionalIndustry, { nullable: true })
  @IsOptional()
  @IsEnum(ProfessionalIndustry)
  industry?: ProfessionalIndustry | null;

  @Field(() => String, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(CURRENT_ROLE_MAX_LENGTH)
  currentRole?: string | null;

  @Field(() => ID, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  currentRoleTermId?: string | null;

  @Field(() => ExperienceRange, { nullable: true })
  @IsOptional()
  @IsEnum(ExperienceRange)
  experienceRange?: ExperienceRange | null;

  @Field(() => ProfessionalGoal, { nullable: true })
  @IsOptional()
  @IsEnum(ProfessionalGoal)
  professionalGoal?: ProfessionalGoal | null;

  @Field(() => String, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(160)
  workLocation?: string | null;

  @Field(() => String, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(PROFESSIONAL_SUMMARY_MAX_LENGTH)
  professionalSummary?: string | null;
}
