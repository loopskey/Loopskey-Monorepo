export enum PodcastGqlObjectNames {
  PODCAST_TRANSLATION = "PodcastTranslation",
  PODCAST = "Podcast",
  PODCAST_EPISODE = "PodcastEpisode",
  PODCAST_PAGE_INFO = "PodcastPageInfo",
  PAGINATED_PODCASTS = "PaginatedPodcasts",
  PODCAST_FILTER_FACETS = "PodcastFilterFacets",
  PODCAST_CATEGORY_FACET = "PodcastCategoryFacet",
}

export enum PodcastGqlInputNames {
  SAVE_PODCAST_TRANSLATION = "SavePodcastTranslationInput",
  SET_PODCAST_TRANSLATION_PUBLICATION = "SetPodcastTranslationPublicationInput",
  PODCAST_SORT = "PodcastSortInput",
  CREATE_PODCAST = "CreatePodcastInput",
  UPDATE_PODCAST = "UpdatePodcastInput",
  PODCAST_FILTER = "PodcastFilterInput",
  PODCAST_PAGINATION = "PodcastPaginationInput",
  CREATE_PODCAST_EPISODE = "CreatePodcastEpisodeInput",
  UPDATE_PODCAST_EPISODE = "UpdatePodcastEpisodeInput",
}

export enum PodcastGqlQueryNames {
  PODCAST_TRANSLATIONS = "podcastTranslations",
  PODCASTS = "podcasts",
  PODCAST_BY_ID = "podcastById",
  PODCAST_BY_SLUG = "podcastBySlug",
  PODCAST_EPISODES = "podcastEpisodes",
  FEATURED_PODCASTS = "featuredPodcasts",
  MY_PROVIDER_PODCASTS = "myProviderPodcasts",
  PODCAST_FILTER_FACETS = "podcastFilterFacets",
}

export enum PodcastGqlMutationNames {
  SAVE_PODCAST_TRANSLATION = "savePodcastTranslation",
  SET_PODCAST_TRANSLATION_PUBLICATION = "setPodcastTranslationPublication",
  CREATE_PODCAST = "createPodcast",
  UPDATE_PODCAST = "updatePodcast",
  DELETE_PODCAST = "deletePodcast",
  PUBLISH_PODCAST = "publishPodcast",
  ARCHIVE_PODCAST = "archivePodcast",
  RESTORE_PODCAST = "restorePodcast",
  CREATE_PODCAST_EPISODE = "createPodcastEpisode",
  UPDATE_PODCAST_EPISODE = "updatePodcastEpisode",
  DELETE_PODCAST_EPISODE = "deletePodcastEpisode",
}

export enum PodcastSortField {
  TITLE = "title",
  RATING = "rating",
  LISTENERS = "listeners",
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  EPISODE_COUNT = "episodeCount",
}

export enum PodcastSortDirection {
  ASC = "asc",
  DESC = "desc",
}
