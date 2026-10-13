import { SetYouTubeChannelTranslationPublicationInput } from "@youtube/dtos/set-youtube-channel-translation-publication.input";
import { SaveYouTubeChannelTranslationInput } from "@youtube/dtos/save-youtube-channel-translation.input";
import { YouTubeChannelTranslationService } from "@youtube/services/youtube-channel-translation.service";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { YouTubeChannelTranslationEntity } from "@youtube/entities/youtube-channel-translation.entity";
import { YouTubeGqlMutationNames } from "@youtube/enums/gql-names.enum";
import { YouTubeGqlQueryNames } from "@youtube/enums/gql-names.enum";
import { TCurrentUserPayload } from "@youtube/types/youtube-service.types";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

const actorOf = (user: TCurrentUserPayload) => ({
  id: user.id ?? user.sub!,
  role: user.role,
});

@Resolver(() => YouTubeChannelTranslationEntity)
export class YouTubeChannelTranslationResolver {
  constructor(
    private readonly translations: YouTubeChannelTranslationService,
  ) {}

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Query(() => [YouTubeChannelTranslationEntity], {
    name: YouTubeGqlQueryNames.YOUTUBE_CHANNEL_TRANSLATIONS,
  })
  youtubeChannelTranslations(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("channelId") channelId: string,
  ) {
    return this.translations.list(channelId, actorOf(user));
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => YouTubeChannelTranslationEntity, {
    name: YouTubeGqlMutationNames.SAVE_YOUTUBE_CHANNEL_TRANSLATION,
  })
  saveYouTubeChannelTranslation(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: SaveYouTubeChannelTranslationInput,
  ) {
    return this.translations.save(input, actorOf(user));
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => YouTubeChannelTranslationEntity, {
    name: YouTubeGqlMutationNames.SET_YOUTUBE_CHANNEL_TRANSLATION_PUBLICATION,
  })
  setYouTubeChannelTranslationPublication(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: SetYouTubeChannelTranslationPublicationInput,
  ) {
    return this.translations.setPublication(input, actorOf(user));
  }
}
