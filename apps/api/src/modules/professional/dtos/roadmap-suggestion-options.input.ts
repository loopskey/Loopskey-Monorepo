import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { Field, ID, InputType } from "@nestjs/graphql";
import { RoadmapDraftFieldKey } from "@professional/enums/roadmap-draft.enum";
import { Transform } from "class-transformer";
import { trim } from "@utils/transform.util";

const SUGGESTABLE_FIELDS = [
  RoadmapDraftFieldKey.SUBJECTS,
  RoadmapDraftFieldKey.TARGET_ROLE,
] as const;

@InputType(ProfessionalGqlInputNames.ROADMAP_SUGGESTION_OPTIONS_INPUT)
export class RoadmapSuggestionOptionsInput {
  @Field(() => ID)
  @IsString()
  draftId: string;

  @Field(() => RoadmapDraftFieldKey)
  @IsIn(SUGGESTABLE_FIELDS)
  field: RoadmapDraftFieldKey;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(120)
  search?: string;
}
