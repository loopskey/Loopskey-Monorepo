import { SetPodcastTranslationPublicationInput } from "@podcast/dtos/set-podcast-translation-publication.input";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { SavePodcastTranslationInput } from "@podcast/dtos/save-podcast-translation.input";
import { PodcastTranslationService } from "@podcast/services/podcast-translation.service";
import { PodcastTranslationEntity } from "@podcast/entities/podcast-translation.entity";
import { PodcastGqlMutationNames } from "@podcast/enums/gql-names.enum";
import { PodcastGqlQueryNames } from "@podcast/enums/gql-names.enum";
import { TCurrentUserPayload } from "@podcast/types/podcast-service.types";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

const actorOf = (user: TCurrentUserPayload) => ({
  id: user.id ?? user.sub!,
  role: user.role,
});

@Resolver(() => PodcastTranslationEntity)
export class PodcastTranslationResolver {
  constructor(private readonly translations: PodcastTranslationService) {}

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Query(() => [PodcastTranslationEntity], {
    name: PodcastGqlQueryNames.PODCAST_TRANSLATIONS,
  })
  podcastTranslations(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("podcastId") podcastId: string,
  ) {
    return this.translations.list(podcastId, actorOf(user));
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => PodcastTranslationEntity, {
    name: PodcastGqlMutationNames.SAVE_PODCAST_TRANSLATION,
  })
  savePodcastTranslation(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: SavePodcastTranslationInput,
  ) {
    return this.translations.save(input, actorOf(user));
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => PodcastTranslationEntity, {
    name: PodcastGqlMutationNames.SET_PODCAST_TRANSLATION_PUBLICATION,
  })
  setPodcastTranslationPublication(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: SetPodcastTranslationPublicationInput,
  ) {
    return this.translations.setPublication(input, actorOf(user));
  }
}
