import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreatePodcastEpisodeInput } from "@podcast/dtos/create-podcast-episode.input";
import { PodcastTranslationService } from "@podcast/services/podcast-translation.service";
import { UpdatePodcastEpisodeInput } from "@podcast/dtos/update-podcast-episode.input";
import { PodcastFilterFacetsEntity } from "@podcast/entities/podcast-filter-facets.entity";
import { PodcastGqlMutationNames } from "@podcast/enums/gql-names.enum";
import { PaginatedPodcastsEntity } from "@podcast/entities/paginated-podcasts.entity";
import { PodcastPaginationInput } from "@podcast/dtos/podcast-pagination";
import { PodcastEpisodeEntity } from "@podcast/entities/podcast-episode.entity";
import { PodcastGqlQueryNames } from "@podcast/enums/gql-names.enum";
import { TCurrentUserPayload } from "@podcast/types/podcast-service.types";
import { CreatePodcastInput } from "@podcast/dtos/create-podcast.input";
import { UpdatePodcastInput } from "@podcast/dtos/update-podcast.input";
import { PodcastFilterInput } from "@podcast/dtos/podcast-filter.input";
import { PodcastSortInput } from "@podcast/dtos/podcast-sort.input";
import { PodcastService } from "@podcast/services/podcast.service";
import { PodcastEntity } from "@podcast/entities/podcast.entity";
import { AppLanguage } from "@prisma/client";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Public } from "@auth/decorators/public.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver(() => PodcastEntity)
export class PodcastResolver {
  constructor(
    private readonly podcastService: PodcastService,
    private readonly translations: PodcastTranslationService,
  ) {}

  @Public()
  @Query(() => PaginatedPodcastsEntity, {
    name: PodcastGqlQueryNames.PODCASTS,
  })
  async podcasts(
    @Args("filter", { nullable: true }) filter?: PodcastFilterInput,
    @Args("pagination", { nullable: true })
    pagination?: PodcastPaginationInput,
    @Args("sort", { nullable: true }) sort?: PodcastSortInput,
    @Args("locale", { type: () => AppLanguage, nullable: true })
    locale?: AppLanguage,
  ) {
    const page = await this.podcastService.findPodcasts(
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
  @Query(() => PodcastFilterFacetsEntity, {
    name: PodcastGqlQueryNames.PODCAST_FILTER_FACETS,
  })
  podcastFilterFacets() {
    return this.podcastService.findPodcastFilterFacets();
  }

  @Public()
  @Query(() => PodcastEntity, {
    name: PodcastGqlQueryNames.PODCAST_BY_ID,
  })
  podcastById(@Args("podcastId") podcastId: string) {
    return this.podcastService.findPodcastById(podcastId);
  }

  @Public()
  @Query(() => PodcastEntity, {
    name: PodcastGqlQueryNames.PODCAST_BY_SLUG,
  })
  async podcastBySlug(
    @Args("slug") slug: string,
    @Args("locale", { type: () => AppLanguage, nullable: true })
    locale?: AppLanguage,
  ) {
    return this.translations.localizeOne(
      await this.podcastService.findPodcastBySlug(slug),
      locale,
    );
  }

  @Public()
  @Query(() => [PodcastEntity], {
    name: PodcastGqlQueryNames.FEATURED_PODCASTS,
  })
  featuredPodcasts(
    @Args("take", { type: () => Int, nullable: true, defaultValue: 12 })
    take?: number,
  ) {
    return this.podcastService.findFeaturedPodcasts(take);
  }

  @Public()
  @Query(() => [PodcastEpisodeEntity], {
    name: PodcastGqlQueryNames.PODCAST_EPISODES,
  })
  podcastEpisodes(@Args("podcastId") podcastId: string) {
    return this.podcastService.findPodcastEpisodes(podcastId);
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Query(() => PaginatedPodcastsEntity, {
    name: PodcastGqlQueryNames.MY_PROVIDER_PODCASTS,
  })
  myProviderPodcasts(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("filter", { nullable: true }) filter?: PodcastFilterInput,
    @Args("pagination", { nullable: true })
    pagination?: PodcastPaginationInput,
    @Args("sort", { nullable: true }) sort?: PodcastSortInput,
  ) {
    return this.podcastService.findMyProviderPodcasts(
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
  @Mutation(() => PodcastEntity, {
    name: PodcastGqlMutationNames.CREATE_PODCAST,
  })
  createPodcast(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: CreatePodcastInput,
  ) {
    return this.podcastService.createPodcast(input, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => PodcastEntity, {
    name: PodcastGqlMutationNames.UPDATE_PODCAST,
  })
  updatePodcast(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: UpdatePodcastInput,
  ) {
    return this.podcastService.updatePodcast(input, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => PodcastEntity, {
    name: PodcastGqlMutationNames.PUBLISH_PODCAST,
  })
  publishPodcast(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("podcastId") podcastId: string,
  ) {
    return this.podcastService.publishPodcast(podcastId, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => PodcastEntity, {
    name: PodcastGqlMutationNames.ARCHIVE_PODCAST,
  })
  archivePodcast(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("podcastId") podcastId: string,
  ) {
    return this.podcastService.archivePodcast(podcastId, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => PodcastEntity, {
    name: PodcastGqlMutationNames.DELETE_PODCAST,
  })
  deletePodcast(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("podcastId") podcastId: string,
  ) {
    return this.podcastService.softDeletePodcast(podcastId, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => PodcastEntity, {
    name: PodcastGqlMutationNames.RESTORE_PODCAST,
  })
  restorePodcast(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("podcastId") podcastId: string,
  ) {
    return this.podcastService.restorePodcast(podcastId, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => PodcastEpisodeEntity, {
    name: PodcastGqlMutationNames.CREATE_PODCAST_EPISODE,
  })
  createPodcastEpisode(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: CreatePodcastEpisodeInput,
  ) {
    return this.podcastService.createPodcastEpisode(input, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => PodcastEpisodeEntity, {
    name: PodcastGqlMutationNames.UPDATE_PODCAST_EPISODE,
  })
  updatePodcastEpisode(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: UpdatePodcastEpisodeInput,
  ) {
    return this.podcastService.updatePodcastEpisode(input, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => PodcastEpisodeEntity, {
    name: PodcastGqlMutationNames.DELETE_PODCAST_EPISODE,
  })
  deletePodcastEpisode(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("episodeId") episodeId: string,
  ) {
    return this.podcastService.deletePodcastEpisode(episodeId, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }
}
