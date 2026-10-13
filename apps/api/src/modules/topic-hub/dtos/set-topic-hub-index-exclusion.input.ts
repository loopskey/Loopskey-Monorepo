import { TopicHubGqlInputNames } from "@topicHub/enums/gql-names.enum";
import { Field, ID, InputType } from "@nestjs/graphql";

import * as V from "class-validator";

@InputType(TopicHubGqlInputNames.SET_INDEX_EXCLUSION)
export class SetTopicHubIndexExclusionInput {
  @Field(() => ID)
  @V.IsString()
  @V.IsNotEmpty()
  @V.MaxLength(64)
  hubId: string;

  @Field()
  @V.IsBoolean()
  excluded: boolean;
}
