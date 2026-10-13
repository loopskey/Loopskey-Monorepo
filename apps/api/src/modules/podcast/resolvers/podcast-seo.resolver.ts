import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { SetContentIndexExclusionInput } from "@common/types/content-seo.types";
import { ContentSeoSettingsEntity } from "@common/types/content-seo.types";
import { PodcastGqlMutationNames } from "@podcast/enums/gql-names.enum";
import { PodcastGqlQueryNames } from "@podcast/enums/gql-names.enum";
import { SaveContentSeoInput } from "@common/types/content-seo.types";
import { TCurrentUserPayload } from "@podcast/types/podcast-service.types";
import { PodcastSeoService } from "@podcast/services/podcast-seo.service";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

const actorOf = (user: TCurrentUserPayload) => ({
  id: user.id ?? user.sub!,
  role: user.role,
});

@Resolver()
export class PodcastSeoResolver {
  constructor(private readonly seo: PodcastSeoService) {}

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Query(() => ContentSeoSettingsEntity, {
    name: PodcastGqlQueryNames.PODCAST_SEO,
  })
  podcastSeo(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("podcastId") podcastId: string,
  ) {
    return this.seo.get(podcastId, actorOf(user));
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => ContentSeoSettingsEntity, {
    name: PodcastGqlMutationNames.SAVE_PODCAST_SEO,
  })
  savePodcastSeo(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: SaveContentSeoInput,
  ) {
    return this.seo.save(input, actorOf(user));
  }

  @Roles(Role.ADMIN)
  @Mutation(() => ContentSeoSettingsEntity, {
    name: PodcastGqlMutationNames.SET_PODCAST_INDEX_EXCLUSION,
  })
  setPodcastIndexExclusion(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: SetContentIndexExclusionInput,
  ) {
    return this.seo.setIndexExclusion(input, actorOf(user));
  }
}
