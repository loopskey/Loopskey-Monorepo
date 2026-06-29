export enum PodcastGqlObjectNames {
  PODCAST = "Podcast",
  PODCAST_EPISODE = "PodcastEpisode",
  PODCAST_PAGE_INFO = "PodcastPageInfo",
  PAGINATED_PODCASTS = "PaginatedPodcasts",
}

export enum PodcastGqlInputNames {
  PODCAST_SORT = "PodcastSortInput",
  CREATE_PODCAST = "CreatePodcastInput",
  UPDATE_PODCAST = "UpdatePodcastInput",
  PODCAST_FILTER = "PodcastFilterInput",
  PODCAST_PAGINATION = "PodcastPaginationInput",
  CREATE_PODCAST_EPISODE = "CreatePodcastEpisodeInput",
  UPDATE_PODCAST_EPISODE = "UpdatePodcastEpisodeInput",
}

export enum PodcastGqlQueryNames {
  PODCASTS = "podcasts",
  PODCAST_BY_ID = "podcastById",
  PODCAST_BY_SLUG = "podcastBySlug",
  PODCAST_EPISODES = "podcastEpisodes",
  FEATURED_PODCASTS = "featuredPodcasts",
  MY_PROVIDER_PODCASTS = "myProviderPodcasts",
}

export enum PodcastGqlMutationNames {
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
