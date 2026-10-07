import { IsEnum, MaxLength, MinLength } from "class-validator";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { Field, ID, InputType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";
import { RoadmapDraftFieldKey } from "@professional/enums/roadmap-draft.enum";
import { SERVICE_AI_LIMITS } from "@infrastructure/service-ai/service-ai.port";
import { Transform } from "class-transformer";
import { trim } from "@utils/transform.util";

@InputType(ProfessionalGqlInputNames.ROADMAP_CHAT_TURN_INPUT)
export class RoadmapChatTurnInput {
  @Field(() => ID)
  @IsString()
  draftId: string;

  @Field(() => String)
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(SERVICE_AI_LIMITS.userMessageMaxLength)
  message: string;

  @IsOptional()
  @IsEnum(RoadmapDraftFieldKey)
  @Field(() => RoadmapDraftFieldKey, { nullable: true })
  answerField?: RoadmapDraftFieldKey | null;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  @Field(() => String, { nullable: true })
  answerValue?: string | null;
}
