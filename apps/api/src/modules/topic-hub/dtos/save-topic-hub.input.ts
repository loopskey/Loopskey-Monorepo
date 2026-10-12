import { AppLanguage, ContentUrlNamespace } from "@prisma/client";
import { Field, ID, InputType, Int } from "@nestjs/graphql";
import { TopicHubGqlInputNames } from "@topicHub/enums/gql-names.enum";
import { TOPIC_HUB_LIMITS } from "@loopskey/api-contracts/validation";
import { Type } from "class-transformer";

import * as V from "class-validator";

import "@topicHub/enums/topic-hub-register.enum";

const CONTENT_KINDS = [
  ContentUrlNamespace.COURSE,
  ContentUrlNamespace.EVENT,
  ContentUrlNamespace.PODCAST,
  ContentUrlNamespace.YOUTUBE,
];

@InputType(TopicHubGqlInputNames.SECTION)
export class TopicHubSectionInput {
  @Field()
  @V.IsString()
  @V.MaxLength(TOPIC_HUB_LIMITS.sectionHeadingMax * 2)
  heading: string;

  @Field()
  @V.IsString()
  @V.MaxLength(TOPIC_HUB_LIMITS.sectionBodyMax * 2)
  body: string;
}

@InputType(TopicHubGqlInputNames.REFERENCE)
export class TopicHubReferenceInput {
  @Field(() => ContentUrlNamespace)
  @V.IsIn(CONTENT_KINDS)
  kind: ContentUrlNamespace;

  @Field(() => ID)
  @V.IsString()
  @V.IsNotEmpty()
  @V.MaxLength(64)
  contentId: string;
}

@InputType(TopicHubGqlInputNames.SAVE)
export class SaveTopicHubInput {
  @Field(() => ID, { nullable: true })
  @V.IsOptional()
  @V.IsString()
  @V.MaxLength(64)
  hubId?: string;

  @Field(() => String, { nullable: true })
  @V.IsOptional()
  @V.IsString()
  @V.MaxLength(400)
  slug?: string;

  @Field(() => AppLanguage)
  @V.IsEnum(AppLanguage)
  locale: AppLanguage;

  @Field()
  @V.IsString()
  @V.MaxLength(TOPIC_HUB_LIMITS.titleMax * 2)
  title: string;

  @Field()
  @V.IsString()
  @V.MaxLength(TOPIC_HUB_LIMITS.introductionMax * 2)
  introduction: string;

  @Field()
  @V.IsString()
  @V.MaxLength(TOPIC_HUB_LIMITS.guidanceMax * 2)
  guidance: string;

  @Field(() => [TopicHubSectionInput], { nullable: true })
  @V.IsOptional()
  @V.IsArray()
  @V.ArrayMaxSize(TOPIC_HUB_LIMITS.sectionsMax * 2)
  @V.ValidateNested({ each: true })
  @Type(() => TopicHubSectionInput)
  sections?: TopicHubSectionInput[];

  @Field(() => String, { nullable: true })
  @V.IsOptional()
  @V.IsString()
  @V.MaxLength(40)
  category?: string | null;

  @Field(() => [TopicHubReferenceInput], { nullable: true })
  @V.IsOptional()
  @V.IsArray()
  @V.ArrayMaxSize(TOPIC_HUB_LIMITS.referencesMax * 2)
  @V.ValidateNested({ each: true })
  @Type(() => TopicHubReferenceInput)
  references?: TopicHubReferenceInput[];

  @Field(() => Int, { nullable: true })
  @V.IsOptional()
  @V.IsInt()
  @V.Min(1)
  expectedVersion?: number;
}
