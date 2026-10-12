import { SetTopicHubTranslationPublicationDocument } from "@/lib/graphql/operations/topic-hub";
import { SetTopicHubIndexExclusionDocument } from "@/lib/graphql/operations/topic-hub";
import { SetTopicHubStatusDocument } from "@/lib/graphql/operations/topic-hub";
import { AdminTopicHubsDocument } from "@/lib/graphql/operations/topic-hub";
import { AdminTopicHubDocument } from "@/lib/graphql/operations/topic-hub";
import { SaveTopicHubDocument } from "@/lib/graphql/operations/topic-hub";
import { baseApi } from "@/lib/rtk/baseApi";

import type { SetTopicHubTranslationPublicationInput } from "@/lib/graphql/base";
import type { AdminTopicHubSummaryFieldsFragment } from "@/lib/graphql/operations/topic-hub";
import type { SetTopicHubIndexExclusionInput } from "@/lib/graphql/base";
import type { AdminTopicHubFieldsFragment } from "@/lib/graphql/operations/topic-hub";
import type { SetTopicHubStatusInput } from "@/lib/graphql/base";
import type { SaveTopicHubInput } from "@/lib/graphql/base";

export const topicHubApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    adminTopicHubs: builder.query<AdminTopicHubSummaryFieldsFragment[], void>({
      query: () => ({ document: AdminTopicHubsDocument }),
      transformResponse: (response: {
        adminTopicHubs: AdminTopicHubSummaryFieldsFragment[];
      }) => response.adminTopicHubs,
      providesTags: ["TopicHubs"],
    }),

    adminTopicHub: builder.query<AdminTopicHubFieldsFragment, string>({
      query: (hubId) => ({
        document: AdminTopicHubDocument,
        variables: { hubId },
      }),
      transformResponse: (response: {
        adminTopicHub: AdminTopicHubFieldsFragment;
      }) => response.adminTopicHub,
      providesTags: ["TopicHubs"],
    }),

    saveTopicHub: builder.mutation<
      AdminTopicHubFieldsFragment,
      SaveTopicHubInput
    >({
      query: (input) => ({
        document: SaveTopicHubDocument,
        variables: { input },
      }),
      transformResponse: (response: {
        saveTopicHub: AdminTopicHubFieldsFragment;
      }) => response.saveTopicHub,
      invalidatesTags: ["TopicHubs"],
    }),

    setTopicHubStatus: builder.mutation<
      AdminTopicHubFieldsFragment,
      SetTopicHubStatusInput
    >({
      query: (input) => ({
        document: SetTopicHubStatusDocument,
        variables: { input },
      }),
      transformResponse: (response: {
        setTopicHubStatus: AdminTopicHubFieldsFragment;
      }) => response.setTopicHubStatus,
      invalidatesTags: ["TopicHubs"],
    }),

    setTopicHubTranslationPublication: builder.mutation<
      AdminTopicHubFieldsFragment,
      SetTopicHubTranslationPublicationInput
    >({
      query: (input) => ({
        document: SetTopicHubTranslationPublicationDocument,
        variables: { input },
      }),
      transformResponse: (response: {
        setTopicHubTranslationPublication: AdminTopicHubFieldsFragment;
      }) => response.setTopicHubTranslationPublication,
      invalidatesTags: ["TopicHubs"],
    }),

    setTopicHubIndexExclusion: builder.mutation<
      { id: string; excludeFromIndex: boolean },
      SetTopicHubIndexExclusionInput
    >({
      query: (input) => ({
        document: SetTopicHubIndexExclusionDocument,
        variables: { input },
      }),
      transformResponse: (response: {
        setTopicHubIndexExclusion: { id: string; excludeFromIndex: boolean };
      }) => response.setTopicHubIndexExclusion,
      invalidatesTags: ["TopicHubs"],
    }),
  }),
});

export const {
  useAdminTopicHubsQuery,
  useSaveTopicHubMutation,
  useLazyAdminTopicHubQuery,
  useSetTopicHubStatusMutation,
  useSetTopicHubIndexExclusionMutation,
  useSetTopicHubTranslationPublicationMutation,
} = topicHubApi;
