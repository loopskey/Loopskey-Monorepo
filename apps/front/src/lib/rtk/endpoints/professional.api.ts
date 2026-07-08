import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";
import * as API from "@/lib/graphql/generated";

export const professionalApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    professionalSettings: builder.query<
      TAPI.ProfessionalSettingsQuery["professionalSettings"],
      void
    >({
      query: () => ({
        document: API.ProfessionalSettingsDocument,
      }),
      transformResponse: (response: TAPI.ProfessionalSettingsQuery) =>
        response.professionalSettings,
      providesTags: ["ProfessionalSettings", "Professional"],
    }),

    professionalOverview: builder.query<
      TAPI.ProfessionalOverviewQuery["professionalOverview"],
      void
    >({
      query: () => ({
        document: API.ProfessionalOverviewDocument,
      }),
      transformResponse: (response: TAPI.ProfessionalOverviewQuery) =>
        response.professionalOverview,
      providesTags: ["ProfessionalOverview", "Professional"],
    }),

    professionalDashboardProfile: builder.query<
      TAPI.ProfessionalDashboardProfileQuery["professionalDashboardProfile"],
      void
    >({
      query: () => ({
        document: API.ProfessionalDashboardProfileDocument,
      }),
      transformResponse: (response: TAPI.ProfessionalDashboardProfileQuery) =>
        response.professionalDashboardProfile,
      providesTags: ["ProfessionalProfile", "Professional"],
    }),

    professionalActiveSessions: builder.query<
      TAPI.ProfessionalActiveSessionsQuery["professionalActiveSessions"],
      void
    >({
      query: () => ({
        document: API.ProfessionalActiveSessionsDocument,
      }),
      transformResponse: (response: TAPI.ProfessionalActiveSessionsQuery) =>
        response.professionalActiveSessions,
      providesTags: ["ProfessionalSessions", "Professional"],
    }),

    professionalMyCourses: builder.query<
      TAPI.ProfessionalMyCoursesQuery["professionalMyCourses"],
      TAPI.ProfessionalMyCoursesQueryVariables | void
    >({
      query: (variables) => ({
        document: API.ProfessionalMyCoursesDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.ProfessionalMyCoursesQuery) =>
        response.professionalMyCourses,
      providesTags: ["ProfessionalCourses", "Professional"],
    }),

    professionalCalendarEvents: builder.query<
      TAPI.ProfessionalCalendarEventsQuery["professionalCalendarEvents"],
      TAPI.ProfessionalCalendarEventsQueryVariables | void
    >({
      query: (variables) => ({
        document: API.ProfessionalCalendarEventsDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.ProfessionalCalendarEventsQuery) =>
        response.professionalCalendarEvents,
      providesTags: ["ProfessionalCalendar", "Professional"],
    }),

    myCalendarEntries: builder.query<
      TAPI.MyCalendarEntriesQuery["myCalendarEntries"],
      void
    >({
      query: () => ({
        document: API.MyCalendarEntriesDocument,
      }),
      transformResponse: (response: TAPI.MyCalendarEntriesQuery) =>
        response.myCalendarEntries,
      providesTags: ["ProfessionalCalendar", "Professional"],
    }),

    createCalendarEvent: builder.mutation<
      TAPI.CreateCalendarEventMutation["createCalendarEvent"],
      TAPI.CreateCalendarEventMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.CreateCalendarEventDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.CreateCalendarEventMutation) =>
        response.createCalendarEvent,
      invalidatesTags: ["ProfessionalCalendar", "Professional"],
    }),

    deleteCalendarEvent: builder.mutation<
      TAPI.DeleteCalendarEventMutation["deleteCalendarEvent"],
      TAPI.DeleteCalendarEventMutationVariables["id"]
    >({
      query: (id) => ({
        document: API.DeleteCalendarEventDocument,
        variables: { id },
      }),
      transformResponse: (response: TAPI.DeleteCalendarEventMutation) =>
        response.deleteCalendarEvent,
      invalidatesTags: ["ProfessionalCalendar", "Professional"],
    }),

    professionalPduReport: builder.query<
      TAPI.ProfessionalPduReportQuery["professionalPduReport"],
      TAPI.ProfessionalPduReportQueryVariables | void
    >({
      query: (variables) => ({
        document: API.ProfessionalPduReportDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.ProfessionalPduReportQuery) =>
        response.professionalPduReport,
      providesTags: ["ProfessionalPdu", "Professional"],
    }),

    professionalPduActivities: builder.query<
      TAPI.ProfessionalPduActivitiesQuery["professionalPduActivities"],
      TAPI.ProfessionalPduActivitiesQueryVariables | void
    >({
      query: (variables) => ({
        document: API.ProfessionalPduActivitiesDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.ProfessionalPduActivitiesQuery) =>
        response.professionalPduActivities,
      providesTags: ["ProfessionalPdu", "Professional"],
    }),

    professionalPayments: builder.query<
      TAPI.ProfessionalPaymentsQuery["professionalPayments"],
      TAPI.ProfessionalPaymentsQueryVariables | void
    >({
      query: (variables) => ({
        document: API.ProfessionalPaymentsDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.ProfessionalPaymentsQuery) =>
        response.professionalPayments,
      providesTags: ["ProfessionalPayments", "Professional"],
    }),

    professionalCertificates: builder.query<
      TAPI.ProfessionalCertificatesQuery["professionalCertificates"],
      TAPI.ProfessionalCertificatesQueryVariables | void
    >({
      query: (variables) => ({
        document: API.ProfessionalCertificatesDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.ProfessionalCertificatesQuery) =>
        response.professionalCertificates,
      providesTags: ["ProfessionalCertificates", "Professional"],
    }),

    updateProfessionalSettings: builder.mutation<
      TAPI.UpdateProfessionalSettingsMutation["updateProfessionalSettings"],
      TAPI.UpdateProfessionalSettingsMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateProfessionalSettingsDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.UpdateProfessionalSettingsMutation) =>
        response.updateProfessionalSettings,
      invalidatesTags: ["ProfessionalSettings", "Professional"],
    }),

    resetProfessionalSettings: builder.mutation<
      TAPI.ResetProfessionalSettingsMutation["resetProfessionalSettings"],
      void
    >({
      query: () => ({
        document: API.ResetProfessionalSettingsDocument,
      }),
      transformResponse: (response: TAPI.ResetProfessionalSettingsMutation) =>
        response.resetProfessionalSettings,
      invalidatesTags: ["ProfessionalSettings", "Professional"],
    }),

    updateProfessionalDashboardProfile: builder.mutation<
      TAPI.UpdateProfessionalDashboardProfileMutation["updateProfessionalDashboardProfile"],
      TAPI.UpdateProfessionalDashboardProfileMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateProfessionalDashboardProfileDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.UpdateProfessionalDashboardProfileMutation,
      ) => response.updateProfessionalDashboardProfile,
      invalidatesTags: [
        "ProfessionalProfile",
        "ProfessionalOverview",
        "Professional",
        "CurrentUser",
        "User",
      ],
    }),

    createProfessionalPduActivity: builder.mutation<
      TAPI.CreateProfessionalPduActivityMutation["createProfessionalPduActivity"],
      TAPI.CreateProfessionalPduActivityMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.CreateProfessionalPduActivityDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.CreateProfessionalPduActivityMutation,
      ) => response.createProfessionalPduActivity,
      invalidatesTags: ["ProfessionalPdu", "ProfessionalOverview"],
    }),

    upsertProfessionalPduTarget: builder.mutation<
      TAPI.UpsertProfessionalPduTargetMutation["upsertProfessionalPduTarget"],
      TAPI.UpsertProfessionalPduTargetMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpsertProfessionalPduTargetDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.UpsertProfessionalPduTargetMutation) =>
        response.upsertProfessionalPduTarget,
      invalidatesTags: ["ProfessionalPdu", "ProfessionalOverview"],
    }),

    professionalMyRoadmaps: builder.query<
      TAPI.ProfessionalMyRoadmapsQuery["professionalMyRoadmaps"],
      TAPI.ProfessionalMyRoadmapsQueryVariables | void
    >({
      query: (variables) => ({
        document: API.ProfessionalMyRoadmapsDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.ProfessionalMyRoadmapsQuery) =>
        response.professionalMyRoadmaps,
      providesTags: ["ProfessionalRoadmaps", "Professional"],
    }),

    professionalExploreRoadmaps: builder.query<
      TAPI.ProfessionalExploreRoadmapsQuery["professionalExploreRoadmaps"],
      TAPI.ProfessionalExploreRoadmapsQueryVariables | void
    >({
      query: (variables) => ({
        document: API.ProfessionalExploreRoadmapsDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.ProfessionalExploreRoadmapsQuery) =>
        response.professionalExploreRoadmaps,
      providesTags: ["ProfessionalRoadmaps", "Professional"],
    }),
  }),
});

export const {
  useProfessionalSettingsQuery,
  useProfessionalOverviewQuery,
  useProfessionalPaymentsQuery,
  useProfessionalPduReportQuery,
  useProfessionalMyCoursesQuery,
  useProfessionalMyRoadmapsQuery,
  useLazyProfessionalPaymentsQuery,
  useProfessionalCertificatesQuery,
  useLazyProfessionalSettingsQuery,
  useLazyProfessionalOverviewQuery,
  useLazyProfessionalMyCoursesQuery,
  useLazyProfessionalPduReportQuery,
  useProfessionalPduActivitiesQuery,
  useProfessionalCalendarEventsQuery,
  useMyCalendarEntriesQuery,
  useCreateCalendarEventMutation,
  useDeleteCalendarEventMutation,
  useProfessionalActiveSessionsQuery,
  useProfessionalExploreRoadmapsQuery,
  useLazyProfessionalCertificatesQuery,
  useResetProfessionalSettingsMutation,
  useProfessionalDashboardProfileQuery,
  useLazyProfessionalPduActivitiesQuery,
  useUpdateProfessionalSettingsMutation,
  useLazyProfessionalCalendarEventsQuery,
  useUpsertProfessionalPduTargetMutation,
  useLazyProfessionalActiveSessionsQuery,
  useCreateProfessionalPduActivityMutation,
  useLazyProfessionalDashboardProfileQuery,
  useUpdateProfessionalDashboardProfileMutation,
} = professionalApi;
