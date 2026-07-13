import { ArrayMaxSize, ArrayUnique, IsArray, IsEnum } from "class-validator";
import { IsOptional, IsString } from "class-validator";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { Field, ID, InputType } from "@nestjs/graphql";
import { SkillLevel } from "@prisma/client";

export const MAX_SELECTED_TERMS = 20;

@InputType(ProfessionalGqlInputNames.UPDATE_PROFESSIONAL_SKILLS_INPUT)
export class UpdateProfessionalSkillsInput {
  @Field(() => [ID])
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(MAX_SELECTED_TERMS)
  @IsString({ each: true })
  mainSkillAreaIds: string[];

  @Field(() => [ID])
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(MAX_SELECTED_TERMS)
  @IsString({ each: true })
  favoriteSubjectIds: string[];

  @Field(() => [ID])
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(MAX_SELECTED_TERMS)
  @IsString({ each: true })
  skillsToImproveIds: string[];

  @Field(() => SkillLevel, { nullable: true })
  @IsOptional()
  @IsEnum(SkillLevel)
  currentSkillLevel?: SkillLevel | null;

  @Field(() => SkillLevel, { nullable: true })
  @IsOptional()
  @IsEnum(SkillLevel)
  targetSkillLevel?: SkillLevel | null;
}
