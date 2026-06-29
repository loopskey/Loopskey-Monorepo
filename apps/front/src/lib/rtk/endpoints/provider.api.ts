import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";
import * as API from "@/lib/graphql/generated";

export const providerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    providerSettings: builder.query<
      TAPI.ProviderSettingsQuery["providerSettings"],
      void
    >({
      query: () => ({
        document: API.ProviderSettingsDocument,
      }),
      transformResponse: (response: TAPI.ProviderSettingsQuery) =>
        response.providerSettings,
      providesTags: ["ProviderSettings", "CurrentUser"],
    }),

    providerOverview: builder.query<
      TAPI.ProviderOverviewQuery["providerOverview"],
      TAPI.ProviderOverviewQueryVariables | void
    >({
      query: (variables) => ({
        document: API.ProviderOverviewDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.ProviderOverviewQuery) =>
        response.providerOverview,
      providesTags: ["ProviderOverview"],
    }),

    providerAnalytics: builder.query<
      TAPI.ProviderAnalyticsQuery["providerAnalytics"],
      TAPI.ProviderAnalyticsQueryVariables | void
    >({
      query: (variables) => ({
        document: API.ProviderAnalyticsDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.ProviderAnalyticsQuery) =>
        response.providerAnalytics,
      providesTags: ["ProviderAnalytics"],
    }),

    providerAnalyticsCsv: builder.query<
      TAPI.ProviderAnalyticsCsvQuery["providerAnalyticsCsv"],
      TAPI.ProviderAnalyticsCsvQueryVariables | void
    >({
      query: (variables) => ({
        document: API.ProviderAnalyticsCsvDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.ProviderAnalyticsCsvQuery) =>
        response.providerAnalyticsCsv,
      providesTags: ["ProviderAnalyticsCsv"],
    }),

    providerAttendees: builder.query<
      TAPI.ProviderAttendeesQuery["providerAttendees"],
      TAPI.ProviderAttendeesQueryVariables | void
    >({
      query: (variables) => ({
        document: API.ProviderAttendeesDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.ProviderAttendeesQuery) =>
        response.providerAttendees,
      providesTags: ["ProviderAttendees"],
    }),

    providerEventsTable: builder.query<
      TAPI.ProviderEventsTableQuery["providerEventsTable"],
      TAPI.ProviderEventsTableQueryVariables | void
    >({
      query: (variables) => ({
        document: API.ProviderEventsTableDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.ProviderEventsTableQuery) =>
        response.providerEventsTable,
      providesTags: ["ProviderEvents"],
    }),

    providerPromotionRequests: builder.query<
      TAPI.ProviderPromotionRequestsQuery["providerPromotionRequests"],
      TAPI.ProviderPromotionRequestsQueryVariables | void
    >({
      query: (variables) => ({
        document: API.ProviderPromotionRequestsDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.ProviderPromotionRequestsQuery) =>
        response.providerPromotionRequests,
      providesTags: ["ProviderPromotions"],
    }),

    updateProviderSettings: builder.mutation<
      TAPI.UpdateProviderSettingsMutation["updateProviderSettings"],
      TAPI.UpdateProviderSettingsMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateProviderSettingsDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.UpdateProviderSettingsMutation) =>
        response.updateProviderSettings,
      invalidatesTags: ["ProviderSettings", "CurrentUser"],
    }),

    submitPromotionRequest: builder.mutation<
      TAPI.SubmitPromotionRequestMutation["submitPromotionRequest"],
      TAPI.SubmitPromotionRequestMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.SubmitPromotionRequestDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.SubmitPromotionRequestMutation) =>
        response.submitPromotionRequest,
      invalidatesTags: ["ProviderPromotions"],
    }),
  }),
});

export const {
  useProviderSettingsQuery,
  useProviderOverviewQuery,
  useProviderAnalyticsQuery,
  useProviderAttendeesQuery,
  useProviderEventsTableQuery,
  useLazyProviderOverviewQuery,
  useLazyProviderSettingsQuery,
  useProviderAnalyticsCsvQuery,
  useLazyProviderAnalyticsQuery,
  useLazyProviderAttendeesQuery,
  useLazyProviderEventsTableQuery,
  useLazyProviderAnalyticsCsvQuery,
  useProviderPromotionRequestsQuery,
  useUpdateProviderSettingsMutation,
  useSubmitPromotionRequestMutation,
  useLazyProviderPromotionRequestsQuery,
} = providerApi;
