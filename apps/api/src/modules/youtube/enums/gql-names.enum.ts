export enum YouTubeGqlObjectNames {
  YOUTUBE_VIDEO = "YouTubeVideo",
  YOUTUBE_CHANNEL = "YouTubeChannel",
  YOUTUBE_CHANNEL_PAGE_INFO = "YouTubeChannelPageInfo",
  PAGINATED_YOUTUBE_CHANNELS = "PaginatedYouTubeChannels",
}

export enum YouTubeGqlInputNames {
  YOUTUBE_CHANNEL_SORT = "YouTubeChannelSortInput",
  CREATE_YOUTUBE_VIDEO = "CreateYouTubeVideoInput",
  UPDATE_YOUTUBE_VIDEO = "UpdateYouTubeVideoInput",
  CREATE_YOUTUBE_CHANNEL = "CreateYouTubeChannelInput",
  UPDATE_YOUTUBE_CHANNEL = "UpdateYouTubeChannelInput",
  YOUTUBE_CHANNEL_FILTER = "YouTubeChannelFilterInput",
  YOUTUBE_CHANNEL_PAGINATION = "YouTubeChannelPaginationInput",
}

export enum YouTubeGqlQueryNames {
  YOUTUBE_VIDEOS = "youtubeVideos",
  YOUTUBE_CHANNELS = "youtubeChannels",
  YOUTUBE_CHANNEL_BY_ID = "youtubeChannelById",
  YOUTUBE_CHANNEL_BY_SLUG = "youtubeChannelBySlug",
  FEATURED_YOUTUBE_CHANNELS = "featuredYouTubeChannels",
  MY_PROVIDER_YOUTUBE_CHANNELS = "myProviderYouTubeChannels",
}

export enum YouTubeGqlMutationNames {
  DELETE_YOUTUBE_VIDEO = "deleteYouTubeVideo",
  CREATE_YOUTUBE_VIDEO = "createYouTubeVideo",
  UPDATE_YOUTUBE_VIDEO = "updateYouTubeVideo",
  CREATE_YOUTUBE_CHANNEL = "createYouTubeChannel",
  DELETE_YOUTUBE_CHANNEL = "deleteYouTubeChannel",
  UPDATE_YOUTUBE_CHANNEL = "updateYouTubeChannel",
  PUBLISH_YOUTUBE_CHANNEL = "publishYouTubeChannel",
  ARCHIVE_YOUTUBE_CHANNEL = "archiveYouTubeChannel",
  RESTORE_YOUTUBE_CHANNEL = "restoreYouTubeChannel",
}
