import { SetTopicHubTranslationPublicationInput } from "@topicHub/dtos/set-topic-hub-translation-publication.input";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { SetTopicHubIndexExclusionInput } from "@topicHub/dtos/set-topic-hub-index-exclusion.input";
import { AdminTopicHubSummaryEntity } from "@topicHub/entities/admin-topic-hub.entity";
import { TopicHubGqlMutationNames } from "@topicHub/enums/gql-names.enum";
import { SetTopicHubStatusInput } from "@topicHub/dtos/set-topic-hub-status.input";
import { TopicHubGqlQueryNames } from "@topicHub/enums/gql-names.enum";
import { AdminTopicHubEntity } from "@topicHub/entities/admin-topic-hub.entity";
import { SaveTopicHubInput } from "@topicHub/dtos/save-topic-hub.input";
import { TopicHubService } from "@topicHub/services/topic-hub.service";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

import type { JwtPayload } from "@common/types/jwt-payload.type";

import "@topicHub/enums/topic-hub-register.enum";

const actorOf = (user: JwtPayload) => ({ id: user.sub });

@Resolver()
@Roles(Role.ADMIN)
export class TopicHubAdminResolver {
  constructor(private readonly hubs: TopicHubService) {}

  @Query(() => [AdminTopicHubSummaryEntity], {
    name: TopicHubGqlQueryNames.ADMIN_TOPIC_HUBS,
  })
  adminTopicHubs() {
    return this.hubs.list();
  }

  @Query(() => AdminTopicHubEntity, {
    name: TopicHubGqlQueryNames.ADMIN_TOPIC_HUB,
  })
  adminTopicHub(@Args("hubId") hubId: string) {
    return this.hubs.get(hubId);
  }

  @Mutation(() => AdminTopicHubEntity, {
    name: TopicHubGqlMutationNames.SAVE_TOPIC_HUB,
  })
  saveTopicHub(
    @CurrentUser() user: JwtPayload,
    @Args("input") input: SaveTopicHubInput,
  ) {
    return this.hubs.save(actorOf(user), input);
  }

  @Mutation(() => AdminTopicHubEntity, {
    name: TopicHubGqlMutationNames.SET_TOPIC_HUB_STATUS,
  })
  setTopicHubStatus(
    @CurrentUser() user: JwtPayload,
    @Args("input") input: SetTopicHubStatusInput,
  ) {
    return this.hubs.setStatus(actorOf(user), input);
  }

  @Mutation(() => AdminTopicHubEntity, {
    name: TopicHubGqlMutationNames.SET_TOPIC_HUB_TRANSLATION_PUBLICATION,
  })
  setTopicHubTranslationPublication(
    @CurrentUser() user: JwtPayload,
    @Args("input") input: SetTopicHubTranslationPublicationInput,
  ) {
    return this.hubs.setTranslationPublication(actorOf(user), input);
  }

  @Mutation(() => AdminTopicHubEntity, {
    name: TopicHubGqlMutationNames.SET_TOPIC_HUB_INDEX_EXCLUSION,
  })
  setTopicHubIndexExclusion(
    @CurrentUser() user: JwtPayload,
    @Args("input") input: SetTopicHubIndexExclusionInput,
  ) {
    return this.hubs.setIndexExclusion(actorOf(user), input);
  }
}
