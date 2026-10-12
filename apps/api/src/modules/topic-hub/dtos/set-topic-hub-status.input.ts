import { Field, ID, InputType, Int } from "@nestjs/graphql";
import { TopicHubGqlInputNames } from "@topicHub/enums/gql-names.enum";
import { TopicHubStatus } from "@prisma/client";

import * as V from "class-validator";

import "@topicHub/enums/topic-hub-register.enum";

@InputType(TopicHubGqlInputNames.SET_STATUS)
export class SetTopicHubStatusInput {
  @Field(() => ID)
  @V.IsString()
  @V.IsNotEmpty()
  @V.MaxLength(64)
  hubId: string;

  @Field(() => TopicHubStatus)
  @V.IsIn([TopicHubStatus.PUBLISHED, TopicHubStatus.WITHDRAWN])
  status: TopicHubStatus;

  @Field(() => Int)
  @V.IsInt()
  @V.Min(1)
  expectedVersion: number;
}
