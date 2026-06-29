import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";
import * as API from "@/lib/graphql/generated";

export const youtubeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    youtubeChannels: builder.query<
      TAPI.YouTubeChannelsQuery["youtubeChannels"],
      TAPI.YouTubeChannelsQueryVariables | void
    >({
      query: (variables) => ({
        document: API.YouTubeChannelsDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.YouTubeChannelsQuery) =>
        response.youtubeChannels,
      providesTags: ["YouTubeChannels"],
    }),

    youtubeChannelById: builder.query<
      TAPI.YouTubeChannelByIdQuery["youtubeChannelById"],
      TAPI.YouTubeChannelByIdQueryVariables
    >({
      query: (variables) => ({
        document: API.YouTubeChannelByIdDocument,
        variables,
      }),
      transformResponse: (response: TAPI.YouTubeChannelByIdQuery) =>
        response.youtubeChannelById,
      providesTags: (_result, _error, arg) => [
        { type: "YouTubeChannels", id: arg.channelId },
      ],
    }),

    youtubeChannelBySlug: builder.query<
      TAPI.YouTubeChannelBySlugQuery["youtubeChannelBySlug"],
      TAPI.YouTubeChannelBySlugQueryVariables
    >({
      query: (variables) => ({
        document: API.YouTubeChannelBySlugDocument,
        variables,
      }),
      transformResponse: (response: TAPI.YouTubeChannelBySlugQuery) =>
        response.youtubeChannelBySlug,
      providesTags: (_result, _error, arg) => [
        { type: "YouTubeChannels", id: arg.slug },
      ],
    }),

    featuredYouTubeChannels: builder.query<
      TAPI.FeaturedYouTubeChannelsQuery["featuredYouTubeChannels"],
      TAPI.FeaturedYouTubeChannelsQueryVariables | void
    >({
      query: (variables) => ({
        document: API.FeaturedYouTubeChannelsDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.FeaturedYouTubeChannelsQuery) =>
        response.featuredYouTubeChannels,
      providesTags: ["YouTubeChannels"],
    }),

    youtubeVideos: builder.query<
      TAPI.YouTubeVideosQuery["youtubeVideos"],
      TAPI.YouTubeVideosQueryVariables
    >({
      query: (variables) => ({
        document: API.YouTubeVideosDocument,
        variables,
      }),
      transformResponse: (response: TAPI.YouTubeVideosQuery) =>
        response.youtubeVideos,
      providesTags: (_result, _error, arg) => [
        { type: "YouTubeVideos", id: arg.channelId },
      ],
    }),

    myProviderYouTubeChannels: builder.query<
      TAPI.MyProviderYouTubeChannelsQuery["myProviderYouTubeChannels"],
      TAPI.MyProviderYouTubeChannelsQueryVariables | void
    >({
      query: (variables) => ({
        document: API.MyProviderYouTubeChannelsDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.MyProviderYouTubeChannelsQuery) =>
        response.myProviderYouTubeChannels,
      providesTags: ["YouTubeChannels", "CurrentUser"],
    }),

    createYouTubeChannel: builder.mutation<
      TAPI.CreateYouTubeChannelMutation["createYouTubeChannel"],
      TAPI.CreateYouTubeChannelMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.CreateYouTubeChannelDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.CreateYouTubeChannelMutation) =>
        response.createYouTubeChannel,
      invalidatesTags: ["YouTubeChannels"],
    }),

    updateYouTubeChannel: builder.mutation<
      TAPI.UpdateYouTubeChannelMutation["updateYouTubeChannel"],
      TAPI.UpdateYouTubeChannelMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateYouTubeChannelDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.UpdateYouTubeChannelMutation) =>
        response.updateYouTubeChannel,
      invalidatesTags: ["YouTubeChannels"],
    }),

    publishYouTubeChannel: builder.mutation<
      TAPI.PublishYouTubeChannelMutation["publishYouTubeChannel"],
      TAPI.PublishYouTubeChannelMutationVariables["channelId"]
    >({
      query: (channelId) => ({
        document: API.PublishYouTubeChannelDocument,
        variables: { channelId },
      }),
      transformResponse: (response: TAPI.PublishYouTubeChannelMutation) =>
        response.publishYouTubeChannel,
      invalidatesTags: ["YouTubeChannels"],
    }),

    archiveYouTubeChannel: builder.mutation<
      TAPI.ArchiveYouTubeChannelMutation["archiveYouTubeChannel"],
      TAPI.ArchiveYouTubeChannelMutationVariables["channelId"]
    >({
      query: (channelId) => ({
        document: API.ArchiveYouTubeChannelDocument,
        variables: { channelId },
      }),
      transformResponse: (response: TAPI.ArchiveYouTubeChannelMutation) =>
        response.archiveYouTubeChannel,
      invalidatesTags: ["YouTubeChannels"],
    }),

    deleteYouTubeChannel: builder.mutation<
      TAPI.DeleteYouTubeChannelMutation["deleteYouTubeChannel"],
      TAPI.DeleteYouTubeChannelMutationVariables["channelId"]
    >({
      query: (channelId) => ({
        document: API.DeleteYouTubeChannelDocument,
        variables: { channelId },
      }),
      transformResponse: (response: TAPI.DeleteYouTubeChannelMutation) =>
        response.deleteYouTubeChannel,
      invalidatesTags: ["YouTubeChannels"],
    }),

    restoreYouTubeChannel: builder.mutation<
      TAPI.RestoreYouTubeChannelMutation["restoreYouTubeChannel"],
      TAPI.RestoreYouTubeChannelMutationVariables["channelId"]
    >({
      query: (channelId) => ({
        document: API.RestoreYouTubeChannelDocument,
        variables: { channelId },
      }),
      transformResponse: (response: TAPI.RestoreYouTubeChannelMutation) =>
        response.restoreYouTubeChannel,
      invalidatesTags: ["YouTubeChannels"],
    }),

    createYouTubeVideo: builder.mutation<
      TAPI.CreateYouTubeVideoMutation["createYouTubeVideo"],
      TAPI.CreateYouTubeVideoMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.CreateYouTubeVideoDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.CreateYouTubeVideoMutation) =>
        response.createYouTubeVideo,
      invalidatesTags: ["YouTubeChannels", "YouTubeVideos"],
    }),

    updateYouTubeVideo: builder.mutation<
      TAPI.UpdateYouTubeVideoMutation["updateYouTubeVideo"],
      TAPI.UpdateYouTubeVideoMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateYouTubeVideoDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.UpdateYouTubeVideoMutation) =>
        response.updateYouTubeVideo,
      invalidatesTags: ["YouTubeChannels", "YouTubeVideos"],
    }),

    deleteYouTubeVideo: builder.mutation<
      TAPI.DeleteYouTubeVideoMutation["deleteYouTubeVideo"],
      TAPI.DeleteYouTubeVideoMutationVariables["videoId"]
    >({
      query: (videoId) => ({
        document: API.DeleteYouTubeVideoDocument,
        variables: { videoId },
      }),
      transformResponse: (response: TAPI.DeleteYouTubeVideoMutation) =>
        response.deleteYouTubeVideo,
      invalidatesTags: ["YouTubeChannels", "YouTubeVideos"],
    }),
  }),
});

export const {
  useYoutubeVideosQuery,
  useYoutubeChannelsQuery,
  useLazyYoutubeVideosQuery,
  useYoutubeChannelByIdQuery,
  useLazyYoutubeChannelsQuery,
  useYoutubeChannelBySlugQuery,
  useUpdateYouTubeVideoMutation,
  useCreateYouTubeVideoMutation,
  useDeleteYouTubeVideoMutation,
  useLazyYoutubeChannelByIdQuery,
  useFeaturedYouTubeChannelsQuery,
  useUpdateYouTubeChannelMutation,
  useCreateYouTubeChannelMutation,
  useDeleteYouTubeChannelMutation,
  usePublishYouTubeChannelMutation,
  useArchiveYouTubeChannelMutation,
  useRestoreYouTubeChannelMutation,
  useLazyYoutubeChannelBySlugQuery,
  useMyProviderYouTubeChannelsQuery,
  useLazyFeaturedYouTubeChannelsQuery,
  useLazyMyProviderYouTubeChannelsQuery,
} = youtubeApi;
