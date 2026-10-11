import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { SetContentIndexExclusionInput } from "@common/types/content-seo.types";
import { YouTubeChannelSeoService } from "@youtube/services/youtube-channel-seo.service";
import { ContentSeoSettingsEntity } from "@common/types/content-seo.types";
import { YouTubeGqlMutationNames } from "@youtube/enums/gql-names.enum";
import { YouTubeGqlQueryNames } from "@youtube/enums/gql-names.enum";
import { SaveContentSeoInput } from "@common/types/content-seo.types";
import { TCurrentUserPayload } from "@youtube/types/youtube-service.types";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

const actorOf = (user: TCurrentUserPayload) => ({
  id: user.id ?? user.sub!,
  role: user.role,
});

@Resolver()
export class YouTubeChannelSeoResolver {
  constructor(private readonly seo: YouTubeChannelSeoService) {}

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Query(() => ContentSeoSettingsEntity, {
    name: YouTubeGqlQueryNames.YOUTUBE_CHANNEL_SEO,
  })
  youtubeChannelSeo(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("channelId") channelId: string,
  ) {
    return this.seo.get(channelId, actorOf(user));
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => ContentSeoSettingsEntity, {
    name: YouTubeGqlMutationNames.SAVE_YOUTUBE_CHANNEL_SEO,
  })
  saveYouTubeChannelSeo(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: SaveContentSeoInput,
  ) {
    return this.seo.save(input, actorOf(user));
  }

  @Roles(Role.ADMIN)
  @Mutation(() => ContentSeoSettingsEntity, {
    name: YouTubeGqlMutationNames.SET_YOUTUBE_CHANNEL_INDEX_EXCLUSION,
  })
  setYouTubeChannelIndexExclusion(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: SetContentIndexExclusionInput,
  ) {
    return this.seo.setIndexExclusion(input, actorOf(user));
  }
}
