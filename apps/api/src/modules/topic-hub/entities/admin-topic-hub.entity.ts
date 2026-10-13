import { AppLanguage, ContentUrlNamespace } from "@prisma/client";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { TopicHubGqlObjectNames } from "@topicHub/enums/gql-names.enum";
import { TopicHubSectionEntity } from "@topicHub/entities/topic-hub.entity";
import { TopicHubStatus } from "@prisma/client";

import "@topicHub/enums/topic-hub-register.enum";

@ObjectType(TopicHubGqlObjectNames.ADMIN_REFERENCE)
export class AdminTopicHubReferenceEntity {
  @Field() isEligible: boolean;
  @Field(() => ID) contentId: string;
  @Field(() => ContentUrlNamespace) kind: ContentUrlNamespace;
  @Field(() => String, { nullable: true }) slug: string | null;
  @Field(() => String, { nullable: true }) title: string | null;
}

@ObjectType(TopicHubGqlObjectNames.ADMIN_TRANSLATION)
export class AdminTopicHubTranslationEntity {
  @Field() title: string;
  @Field() guidance: string;
  @Field() isPublished: boolean;
  @Field() introduction: string;
  @Field(() => Int) version: number;
  @Field(() => AppLanguage) locale: AppLanguage;
  @Field(() => [TopicHubSectionEntity]) sections: TopicHubSectionEntity[];
}

@ObjectType(TopicHubGqlObjectNames.ADMIN_SUMMARY)
export class AdminTopicHubSummaryEntity {
  @Field() slug: string;
  @Field() title: string;
  @Field() updatedAt: Date;
  @Field(() => ID) id: string;
  @Field() needsReview: boolean;
  @Field(() => Int) version: number;
  @Field() excludeFromIndex: boolean;
  @Field(() => Int) linkCount: number;
  @Field(() => Int) eligibleLinkCount: number;
  @Field(() => TopicHubStatus) status: TopicHubStatus;
  @Field(() => Date, { nullable: true }) publishedAt: Date | null;
}

@ObjectType(TopicHubGqlObjectNames.ADMIN_HUB)
export class AdminTopicHubEntity extends AdminTopicHubSummaryEntity {
  @Field() guidance: string;
  @Field() introduction: string;
  @Field(() => String, { nullable: true }) category: string | null;
  @Field(() => [TopicHubSectionEntity]) sections: TopicHubSectionEntity[];
  @Field(() => [AdminTopicHubReferenceEntity])
  references: AdminTopicHubReferenceEntity[];
  @Field(() => [AdminTopicHubTranslationEntity])
  translations: AdminTopicHubTranslationEntity[];
}
