import { AppLanguage, ContentUrlNamespace } from "@prisma/client";
import { TopicHubGqlObjectNames } from "@topicHub/enums/gql-names.enum";
import { Field, ObjectType } from "@nestjs/graphql";

import "@topicHub/enums/topic-hub-register.enum";

@ObjectType(TopicHubGqlObjectNames.SECTION)
export class TopicHubSectionEntity {
  @Field() body: string;
  @Field() heading: string;
}

@ObjectType(TopicHubGqlObjectNames.ITEM)
export class TopicHubItemEntity {
  @Field() slug: string;
  @Field() title: string;
  @Field(() => ContentUrlNamespace) kind: ContentUrlNamespace;
  @Field(() => String, { nullable: true }) summary: string | null;
  @Field(() => String, { nullable: true }) imageUrl: string | null;
  @Field(() => String, { nullable: true }) category: string | null;
}

@ObjectType(TopicHubGqlObjectNames.HUB)
export class TopicHubEntity {
  @Field() slug: string;
  @Field() title: string;
  @Field() updatedAt: Date;
  @Field() guidance: string;
  @Field() publishedAt: Date;
  @Field() introduction: string;
  @Field() excludeFromIndex: boolean;
  @Field(() => [AppLanguage]) availableLocales: AppLanguage[];
  @Field(() => [TopicHubItemEntity]) items: TopicHubItemEntity[];
  @Field(() => String, { nullable: true }) category: string | null;
  @Field(() => [TopicHubSectionEntity]) sections: TopicHubSectionEntity[];
  @Field(() => AppLanguage, { nullable: true })
  contentLanguage: AppLanguage | null;
}

@ObjectType(TopicHubGqlObjectNames.SUMMARY)
export class TopicHubSummaryEntity {
  @Field() slug: string;
  @Field() title: string;
  @Field() introduction: string;
}
