import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";
import * as API from "@/lib/graphql/generated";

export const podcastApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    podcasts: builder.query<
      TAPI.PodcastsQuery["podcasts"],
      TAPI.PodcastsQueryVariables | void
    >({
      query: (variables) => ({
        document: API.PodcastsDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.PodcastsQuery) => response.podcasts,
      providesTags: ["Podcasts"],
    }),

    podcastById: builder.query<
      TAPI.PodcastByIdQuery["podcastById"],
      TAPI.PodcastByIdQueryVariables
    >({
      query: (variables) => ({
        document: API.PodcastByIdDocument,
        variables,
      }),
      transformResponse: (response: TAPI.PodcastByIdQuery) =>
        response.podcastById,
      providesTags: (_result, _error, arg) => [
        { type: "Podcasts", id: arg.podcastId },
      ],
    }),

    podcastBySlug: builder.query<
      TAPI.PodcastBySlugQuery["podcastBySlug"],
      TAPI.PodcastBySlugQueryVariables
    >({
      query: (variables) => ({
        document: API.PodcastBySlugDocument,
        variables,
      }),
      transformResponse: (response: TAPI.PodcastBySlugQuery) =>
        response.podcastBySlug,
      providesTags: (_result, _error, arg) => [
        { type: "Podcasts", id: arg.slug },
      ],
    }),

    featuredPodcasts: builder.query<
      TAPI.FeaturedPodcastsQuery["featuredPodcasts"],
      TAPI.FeaturedPodcastsQueryVariables | void
    >({
      query: (variables) => ({
        document: API.FeaturedPodcastsDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.FeaturedPodcastsQuery) =>
        response.featuredPodcasts,
      providesTags: ["Podcasts"],
    }),

    podcastEpisodes: builder.query<
      TAPI.PodcastEpisodesQuery["podcastEpisodes"],
      TAPI.PodcastEpisodesQueryVariables
    >({
      query: (variables) => ({
        document: API.PodcastEpisodesDocument,
        variables,
      }),
      transformResponse: (response: TAPI.PodcastEpisodesQuery) =>
        response.podcastEpisodes,
      providesTags: (_result, _error, arg) => [
        { type: "PodcastEpisodes", id: arg.podcastId },
      ],
    }),

    myProviderPodcasts: builder.query<
      TAPI.MyProviderPodcastsQuery["myProviderPodcasts"],
      TAPI.MyProviderPodcastsQueryVariables | void
    >({
      query: (variables) => ({
        document: API.MyProviderPodcastsDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.MyProviderPodcastsQuery) =>
        response.myProviderPodcasts,
      providesTags: ["Podcasts", "CurrentUser"],
    }),

    createPodcast: builder.mutation<
      TAPI.CreatePodcastMutation["createPodcast"],
      TAPI.CreatePodcastMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.CreatePodcastDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.CreatePodcastMutation) =>
        response.createPodcast,
      invalidatesTags: ["Podcasts"],
    }),

    updatePodcast: builder.mutation<
      TAPI.UpdatePodcastMutation["updatePodcast"],
      TAPI.UpdatePodcastMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdatePodcastDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.UpdatePodcastMutation) =>
        response.updatePodcast,
      invalidatesTags: ["Podcasts"],
    }),

    publishPodcast: builder.mutation<
      TAPI.PublishPodcastMutation["publishPodcast"],
      TAPI.PublishPodcastMutationVariables["podcastId"]
    >({
      query: (podcastId) => ({
        document: API.PublishPodcastDocument,
        variables: { podcastId },
      }),
      transformResponse: (response: TAPI.PublishPodcastMutation) =>
        response.publishPodcast,
      invalidatesTags: ["Podcasts"],
    }),

    archivePodcast: builder.mutation<
      TAPI.ArchivePodcastMutation["archivePodcast"],
      TAPI.ArchivePodcastMutationVariables["podcastId"]
    >({
      query: (podcastId) => ({
        document: API.ArchivePodcastDocument,
        variables: { podcastId },
      }),
      transformResponse: (response: TAPI.ArchivePodcastMutation) =>
        response.archivePodcast,
      invalidatesTags: ["Podcasts"],
    }),

    deletePodcast: builder.mutation<
      TAPI.DeletePodcastMutation["deletePodcast"],
      TAPI.DeletePodcastMutationVariables["podcastId"]
    >({
      query: (podcastId) => ({
        document: API.DeletePodcastDocument,
        variables: { podcastId },
      }),
      transformResponse: (response: TAPI.DeletePodcastMutation) =>
        response.deletePodcast,
      invalidatesTags: ["Podcasts"],
    }),

    restorePodcast: builder.mutation<
      TAPI.RestorePodcastMutation["restorePodcast"],
      TAPI.RestorePodcastMutationVariables["podcastId"]
    >({
      query: (podcastId) => ({
        document: API.RestorePodcastDocument,
        variables: { podcastId },
      }),
      transformResponse: (response: TAPI.RestorePodcastMutation) =>
        response.restorePodcast,
      invalidatesTags: ["Podcasts"],
    }),

    createPodcastEpisode: builder.mutation<
      TAPI.CreatePodcastEpisodeMutation["createPodcastEpisode"],
      TAPI.CreatePodcastEpisodeMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.CreatePodcastEpisodeDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.CreatePodcastEpisodeMutation) =>
        response.createPodcastEpisode,
      invalidatesTags: ["Podcasts", "PodcastEpisodes"],
    }),

    updatePodcastEpisode: builder.mutation<
      TAPI.UpdatePodcastEpisodeMutation["updatePodcastEpisode"],
      TAPI.UpdatePodcastEpisodeMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdatePodcastEpisodeDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.UpdatePodcastEpisodeMutation) =>
        response.updatePodcastEpisode,
      invalidatesTags: ["Podcasts", "PodcastEpisodes"],
    }),

    deletePodcastEpisode: builder.mutation<
      TAPI.DeletePodcastEpisodeMutation["deletePodcastEpisode"],
      TAPI.DeletePodcastEpisodeMutationVariables["episodeId"]
    >({
      query: (episodeId) => ({
        document: API.DeletePodcastEpisodeDocument,
        variables: { episodeId },
      }),
      transformResponse: (response: TAPI.DeletePodcastEpisodeMutation) =>
        response.deletePodcastEpisode,
      invalidatesTags: ["Podcasts", "PodcastEpisodes"],
    }),
  }),
});

export const {
  usePodcastsQuery,
  usePodcastByIdQuery,
  useLazyPodcastsQuery,
  usePodcastBySlugQuery,
  usePodcastEpisodesQuery,
  useLazyPodcastByIdQuery,
  useCreatePodcastMutation,
  useUpdatePodcastMutation,
  useFeaturedPodcastsQuery,
  useDeletePodcastMutation,
  usePublishPodcastMutation,
  useArchivePodcastMutation,
  useRestorePodcastMutation,
  useLazyPodcastBySlugQuery,
  useMyProviderPodcastsQuery,
  useLazyPodcastEpisodesQuery,
  useLazyFeaturedPodcastsQuery,
  useLazyMyProviderPodcastsQuery,
  useCreatePodcastEpisodeMutation,
  useUpdatePodcastEpisodeMutation,
  useDeletePodcastEpisodeMutation,
} = podcastApi;
