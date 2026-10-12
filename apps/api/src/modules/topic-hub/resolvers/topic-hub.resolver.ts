import { AppLanguage, ContentUrlNamespace } from "@prisma/client";
import { Args, Int, Query, Resolver } from "@nestjs/graphql";
import { TopicHubGqlQueryNames } from "@topicHub/enums/gql-names.enum";
import { TopicHubPublicService } from "@topicHub/services/topic-hub-public.service";
import { TopicHubSummaryEntity } from "@topicHub/entities/topic-hub.entity";
import { TopicHubEntity } from "@topicHub/entities/topic-hub.entity";
import { Public } from "@common/decorators/public.decorator";

import "@topicHub/enums/topic-hub-register.enum";

@Resolver()
export class TopicHubResolver {
  constructor(private readonly hubs: TopicHubPublicService) {}

  @Public()
  @Query(() => TopicHubEntity, {
    name: TopicHubGqlQueryNames.TOPIC_HUB_BY_SLUG,
  })
  topicHubBySlug(
    @Args("slug") slug: string,
    @Args("locale", { type: () => AppLanguage, nullable: true })
    locale?: AppLanguage,
  ) {
    return this.hubs.bySlug(slug, locale);
  }

  @Public()
  @Query(() => [TopicHubSummaryEntity], {
    name: TopicHubGqlQueryNames.TOPIC_HUBS,
  })
  topicHubs(
    @Args("locale", { type: () => AppLanguage, nullable: true })
    locale?: AppLanguage,
    @Args("take", { type: () => Int, nullable: true }) take?: number,
  ) {
    return this.hubs.list(locale, take);
  }

  @Public()
  @Query(() => [TopicHubSummaryEntity], {
    name: TopicHubGqlQueryNames.TOPIC_HUBS_FOR_CONTENT,
  })
  topicHubsForContent(
    @Args("kind", { type: () => ContentUrlNamespace })
    kind: ContentUrlNamespace,
    @Args("contentId") contentId: string,
    @Args("locale", { type: () => AppLanguage, nullable: true })
    locale?: AppLanguage,
  ) {
    return this.hubs.forContent(kind, contentId, locale);
  }
}
