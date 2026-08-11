import { ArrayMaxSize, ArrayUnique, IsArray, IsBoolean } from "class-validator";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { ONBOARDING_MAX_SKILLS } from "@professional/enums/profile-section.enum";
import { Field, ID, InputType } from "@nestjs/graphql";
import { ProfessionalGoal } from "@prisma/client";
import { trimToNull } from "@utils/transform.util";
import { Transform } from "class-transformer";

@InputType(ProfessionalGqlInputNames.COMPLETE_PROFESSIONAL_ONBOARDING_INPUT)
export class CompleteProfessionalOnboardingInput {
  @Field(() => ProfessionalGoal)
  @IsEnum(ProfessionalGoal)
  professionalGoal: ProfessionalGoal;

  @Field(() => String)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @MaxLength(120)
  currentRole: string;

  @Field(() => [ID], { defaultValue: [] })
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(ONBOARDING_MAX_SKILLS)
  @IsString({ each: true })
  skillsToImproveIds: string[];

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  suggestSkills: boolean;

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
  certificationIssuer?: string | null;
}
