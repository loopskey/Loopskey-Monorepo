import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { YouTubeChannelFilterFacetsEntity } from "@youtube/entities/youtube-channel-filter-facets.entity";
import { YouTubeChannelTranslationService } from "@youtube/services/youtube-channel-translation.service";
import { PaginatedYouTubeChannelsEntity } from "@youtube/entities/paginated-youtube-channels.entity";
import { YouTubeChannelPaginationInput } from "@modules/youtube/dtos/youtube-channel-pagination.input";
import { CreateYouTubeChannelInput } from "@youtube/dtos/create-youtube-channel.input";
import { UpdateYouTubeChannelInput } from "@youtube/dtos/update-youtube-channel.input";
import { YouTubeChannelFilterInput } from "@youtube/dtos/youtube-channel-filter.input";
import { YouTubeChannelSortInput } from "@youtube/dtos/youtube-channel-sort.input";
import { CreateYouTubeVideoInput } from "@youtube/dtos/create-youtube-video.input";
import { YouTubeGqlMutationNames } from "@youtube/enums/gql-names.enum";
import { UpdateYouTubeVideoInput } from "@youtube/dtos/update-youtube-video.input";
import { YouTubeGqlQueryNames } from "@youtube/enums/gql-names.enum";
import { YouTubeChannelEntity } from "@modules/youtube/entities/youtube-channel.entity";
import { TCurrentUserPayload } from "@youtube/types/youtube-service.types";
import { YouTubeVideoEntity } from "@youtube/entities/youtube-video.entity";
import { YouTubeService } from "@youtube/services/youtbue.service";
import { AppLanguage } from "@prisma/client";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Public } from "@auth/decorators/public.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver(() => YouTubeChannelEntity)
export class YouTubeResolver {
  constructor(
    private readonly youtubeService: YouTubeService,
    private readonly translations: YouTubeChannelTranslationService,
  ) {}

  @Public()
  @Query(() => PaginatedYouTubeChannelsEntity, {
    name: YouTubeGqlQueryNames.YOUTUBE_CHANNELS,
  })
  async youtubeChannels(
    @Args("filter", { nullable: true }) filter?: YouTubeChannelFilterInput,
    @Args("pagination", { nullable: true })
    pagination?: YouTubeChannelPaginationInput,
    @Args("sort", { nullable: true }) sort?: YouTubeChannelSortInput,
    @Args("locale", { type: () => AppLanguage, nullable: true })
    locale?: AppLanguage,
  ) {
    const page = await this.youtubeService.findChannels(
      filter,
      pagination,
      sort,
    );
    return {
      ...page,
      items: await this.translations.localizeMany([...page.items], locale),
    };
  }

  @Public()
  @Query(() => YouTubeChannelFilterFacetsEntity, {
    name: YouTubeGqlQueryNames.YOUTUBE_CHANNEL_FILTER_FACETS,
  })
  youtubeChannelFilterFacets() {
    return this.youtubeService.findYouTubeChannelFilterFacets();
  }

  @Public()
  @Query(() => YouTubeChannelEntity, {
    name: YouTubeGqlQueryNames.YOUTUBE_CHANNEL_BY_ID,
  })
  youtubeChannelById(@Args("channelId") channelId: string) {
    return this.youtubeService.findChannelById(channelId);
  }

  @Public()
  @Query(() => YouTubeChannelEntity, {
    name: YouTubeGqlQueryNames.YOUTUBE_CHANNEL_BY_SLUG,
  })
  async youtubeChannelBySlug(
    @Args("slug") slug: string,
    @Args("locale", { type: () => AppLanguage, nullable: true })
    locale?: AppLanguage,
  ) {
    return this.translations.localizeOne(
      await this.youtubeService.findChannelBySlug(slug),
      locale,
    );
  }

  @Public()
  @Query(() => [YouTubeChannelEntity], {
    name: YouTubeGqlQueryNames.FEATURED_YOUTUBE_CHANNELS,
  })
  featuredYouTubeChannels(
    @Args("take", { type: () => Int, nullable: true, defaultValue: 12 })
    take?: number,
  ) {
    return this.youtubeService.findFeaturedChannels(take);
  }

  @Public()
  @Query(() => [YouTubeVideoEntity], {
    name: YouTubeGqlQueryNames.YOUTUBE_VIDEOS,
  })
  youtubeVideos(@Args("channelId") channelId: string) {
    return this.youtubeService.findVideos(channelId);
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Query(() => PaginatedYouTubeChannelsEntity, {
    name: YouTubeGqlQueryNames.MY_PROVIDER_YOUTUBE_CHANNELS,
  })
  myProviderYouTubeChannels(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("filter", { nullable: true }) filter?: YouTubeChannelFilterInput,
    @Args("pagination", { nullable: true })
    pagination?: YouTubeChannelPaginationInput,
    @Args("sort", { nullable: true }) sort?: YouTubeChannelSortInput,
  ) {
    return this.youtubeService.findMyProviderChannels(
      {
        id: user.id ?? user.sub!,
        role: user.role,
      },
      filter,
      pagination,
      sort,
    );
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => YouTubeChannelEntity, {
    name: YouTubeGqlMutationNames.CREATE_YOUTUBE_CHANNEL,
  })
  createYouTubeChannel(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: CreateYouTubeChannelInput,
  ) {
    return this.youtubeService.createChannel(input, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => YouTubeChannelEntity, {
    name: YouTubeGqlMutationNames.UPDATE_YOUTUBE_CHANNEL,
  })
  updateYouTubeChannel(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: UpdateYouTubeChannelInput,
  ) {
    return this.youtubeService.updateChannel(input, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => YouTubeChannelEntity, {
    name: YouTubeGqlMutationNames.PUBLISH_YOUTUBE_CHANNEL,
  })
  publishYouTubeChannel(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("channelId") channelId: string,
  ) {
    return this.youtubeService.publishChannel(channelId, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => YouTubeChannelEntity, {
    name: YouTubeGqlMutationNames.ARCHIVE_YOUTUBE_CHANNEL,
  })
  archiveYouTubeChannel(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("channelId") channelId: string,
  ) {
    return this.youtubeService.archiveChannel(channelId, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => YouTubeChannelEntity, {
    name: YouTubeGqlMutationNames.DELETE_YOUTUBE_CHANNEL,
  })
  deleteYouTubeChannel(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("channelId") channelId: string,
  ) {
    return this.youtubeService.softDeleteChannel(channelId, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => YouTubeChannelEntity, {
    name: YouTubeGqlMutationNames.RESTORE_YOUTUBE_CHANNEL,
  })
  restoreYouTubeChannel(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("channelId") channelId: string,
  ) {
    return this.youtubeService.restoreChannel(channelId, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => YouTubeVideoEntity, {
    name: YouTubeGqlMutationNames.CREATE_YOUTUBE_VIDEO,
  })
  createYouTubeVideo(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: CreateYouTubeVideoInput,
  ) {
    return this.youtubeService.createVideo(input, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => YouTubeVideoEntity, {
    name: YouTubeGqlMutationNames.UPDATE_YOUTUBE_VIDEO,
  })
  updateYouTubeVideo(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: UpdateYouTubeVideoInput,
  ) {
    return this.youtubeService.updateVideo(input, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => YouTubeVideoEntity, {
    name: YouTubeGqlMutationNames.DELETE_YOUTUBE_VIDEO,
  })
  deleteYouTubeVideo(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("videoId") videoId: string,
  ) {
    return this.youtubeService.deleteVideo(videoId, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }
}
