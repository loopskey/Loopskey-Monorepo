import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { ExperienceRange, ProfessionalIndustry } from "@prisma/client";
import { PROFESSIONAL_SUMMARY_MAX_LENGTH } from "@professional/enums/profile-section.enum";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";
import { trimToNull } from "@utils/functions-helper";
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
  @MaxLength(120)
  currentRole?: string | null;

  @Field(() => ExperienceRange, { nullable: true })
  @IsOptional()
  @IsEnum(ExperienceRange)
  experienceRange?: ExperienceRange | null;

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
