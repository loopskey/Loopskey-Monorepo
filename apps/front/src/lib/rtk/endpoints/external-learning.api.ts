import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";
import * as API from "@/lib/graphql/generated";

export const externalLearningApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    trackExternalLearningClick: builder.mutation<
      TAPI.TrackExternalLearningClickMutation["trackExternalLearningClick"],
      TAPI.TrackExternalLearningClickMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.TrackExternalLearningClickDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.TrackExternalLearningClickMutation) =>
        response.trackExternalLearningClick,
      invalidatesTags: ["ExternalLearning"],
    }),

    myExternalLearningActivities: builder.query<
      TAPI.MyExternalLearningActivitiesQuery["myExternalLearningActivities"],
      TAPI.MyExternalLearningActivitiesQueryVariables | void
    >({
      query: (variables) => ({
        document: API.MyExternalLearningActivitiesDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.MyExternalLearningActivitiesQuery) =>
        response.myExternalLearningActivities,
      providesTags: ["ExternalLearning"],
    }),

    confirmExternalLearning: builder.mutation<
      TAPI.ConfirmExternalLearningMutation["confirmExternalLearning"],
      TAPI.ConfirmExternalLearningMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.ConfirmExternalLearningDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.ConfirmExternalLearningMutation) =>
        response.confirmExternalLearning,
      invalidatesTags: [
        "ExternalLearning",
        "ProfessionalDashboard",
        "OrganizationReports",
      ],
    }),

    ignoreExternalLearning: builder.mutation<
      TAPI.IgnoreExternalLearningMutation["ignoreExternalLearning"],
      TAPI.IgnoreExternalLearningMutationVariables["activityId"]
    >({
      query: (activityId) => ({
        document: API.IgnoreExternalLearningDocument,
        variables: { activityId },
      }),
      transformResponse: (response: TAPI.IgnoreExternalLearningMutation) =>
        response.ignoreExternalLearning,
      invalidatesTags: ["ExternalLearning"],
    }),
  }),
});

export const {
  useIgnoreExternalLearningMutation,
  useConfirmExternalLearningMutation,
  useMyExternalLearningActivitiesQuery,
  useTrackExternalLearningClickMutation,
} = externalLearningApi;
