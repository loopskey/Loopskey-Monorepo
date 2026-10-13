import { Field, ID, InputType, Int } from "@nestjs/graphql";
import { TopicHubGqlInputNames } from "@topicHub/enums/gql-names.enum";
import { AppLanguage } from "@prisma/client";

import * as V from "class-validator";

import "@topicHub/enums/topic-hub-register.enum";

@InputType(TopicHubGqlInputNames.SET_TRANSLATION_PUBLICATION)
export class SetTopicHubTranslationPublicationInput {
  @Field(() => ID)
  @V.IsString()
  @V.IsNotEmpty()
  @V.MaxLength(64)
  hubId: string;

  @Field(() => AppLanguage)
  @V.IsIn([AppLanguage.FR])
  locale: AppLanguage;

  @Field()
  @V.IsBoolean()
  published: boolean;

  @Field(() => Int)
  @V.IsInt()
  @V.Min(1)
  expectedVersion: number;
}
