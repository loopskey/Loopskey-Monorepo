import { Field, ID, InputType } from "@nestjs/graphql";
import { IsString, MaxLength, MinLength } from "class-validator";
import { SERVICE_AI_LIMITS } from "@infrastructure/service-ai/service-ai.port";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { trim } from "@utils/transform.util";
import { Transform } from "class-transformer";

@InputType(ProfessionalGqlInputNames.ROADMAP_CHAT_TURN_INPUT)
export class RoadmapChatTurnInput {
  @Field(() => ID)
  @IsString()
  draftId: string;

  /**
   * Bounded by the provider's own limit rather than a number of our choosing,
   * so an over-long answer is a friendly validation message here instead of a
   * rejection from the other side of the network.
   */
  @Field(() => String)
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(SERVICE_AI_LIMITS.userMessageMaxLength)
  message: string;
}
