import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";
import * as API from "@/lib/graphql/operations/professional";

export const PROFILE_SECTION_TAGS = [
  "User",
  "CurrentUser",
  "Professional",
  "ProfessionalProfile",
  "ProfessionalOverview",
] as const;

export const CREDENTIAL_TAGS = [
  "Professional",
  "ProfessionalProfile",
  "ProfessionalCredentials",
] as const;

export const CERTIFICATE_TAGS = [
  "ProfessionalCpdPlan",
  "ProfessionalOverview",
  "ProfessionalCertificates",
] as const;

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

    professionalProfileTaxonomy: builder.query<
      TAPI.ProfessionalProfileTaxonomyQuery["professionalProfileTaxonomy"],
      TAPI.ProfessionalProfileTaxonomyQueryVariables | void
    >({
      query: (variables) => ({
        document: API.ProfessionalProfileTaxonomyDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.ProfessionalProfileTaxonomyQuery) =>
        response.professionalProfileTaxonomy,
      providesTags: ["ProfessionalProfileTaxonomy", "Professional"],
    }),

    professionalCpdPlans: builder.query<
      TAPI.ProfessionalCpdPlansQuery["professionalCpdPlans"],
      void
    >({
      query: () => ({
        document: API.ProfessionalCpdPlansDocument,
      }),
      transformResponse: (response: TAPI.ProfessionalCpdPlansQuery) =>
        response.professionalCpdPlans,
      providesTags: ["ProfessionalPdu", "Professional"],
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

    professionalPduActivitySummary: builder.query<
      TAPI.ProfessionalPduActivitySummaryQuery["professionalPduActivitySummary"],
      void
    >({
      query: () => ({ document: API.ProfessionalPduActivitySummaryDocument }),
      transformResponse: (response: TAPI.ProfessionalPduActivitySummaryQuery) =>
        response.professionalPduActivitySummary,
      providesTags: ["ProfessionalPdu", "Professional"],
    }),

    professionalPduActivity: builder.query<
      TAPI.ProfessionalPduActivityQuery["professionalPduActivity"],
      TAPI.ProfessionalPduActivityQueryVariables
    >({
      query: (variables) => ({
        document: API.ProfessionalPduActivityDocument,
        variables,
      }),
      transformResponse: (response: TAPI.ProfessionalPduActivityQuery) =>
        response.professionalPduActivity,
      providesTags: ["ProfessionalPdu", "Professional"],
    }),

    professionalContentCompletion: builder.query<
      TAPI.ProfessionalContentCompletionQuery["professionalContentCompletion"],
      TAPI.ProfessionalContentCompletionQueryVariables
    >({
      query: (variables) => ({
        document: API.ProfessionalContentCompletionDocument,
        variables,
      }),
      transformResponse: (response: TAPI.ProfessionalContentCompletionQuery) =>
        response.professionalContentCompletion,
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

    professionalCertificate: builder.query<
      TAPI.ProfessionalCertificateQuery["professionalCertificate"],
      TAPI.ProfessionalCertificateQueryVariables
    >({
      query: (variables) => ({
        document: API.ProfessionalCertificateDocument,
        variables,
      }),
      transformResponse: (response: TAPI.ProfessionalCertificateQuery) =>
        response.professionalCertificate,
      providesTags: ["ProfessionalCertificates", "Professional"],
    }),

    professionalCertificateSummary: builder.query<
      TAPI.ProfessionalCertificateSummaryQuery["professionalCertificateSummary"],
      void
    >({
      query: () => ({
        document: API.ProfessionalCertificateSummaryDocument,
      }),
      transformResponse: (response: TAPI.ProfessionalCertificateSummaryQuery) =>
        response.professionalCertificateSummary,
      providesTags: ["ProfessionalCertificates", "Professional"],
    }),

    professionalCertificateIssuers: builder.query<
      TAPI.ProfessionalCertificateIssuersQuery["professionalCertificateIssuers"],
      void
    >({
      query: () => ({
        document: API.ProfessionalCertificateIssuersDocument,
      }),
      transformResponse: (response: TAPI.ProfessionalCertificateIssuersQuery) =>
        response.professionalCertificateIssuers,
      providesTags: ["ProfessionalCertificates", "Professional"],
    }),

    createProfessionalCertificate: builder.mutation<
      TAPI.CreateProfessionalCertificateMutation["createProfessionalCertificate"],
      TAPI.CreateProfessionalCertificateMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.CreateProfessionalCertificateDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.CreateProfessionalCertificateMutation,
      ) => response.createProfessionalCertificate,
      invalidatesTags: CERTIFICATE_TAGS,
    }),

    updateProfessionalCertificate: builder.mutation<
      TAPI.UpdateProfessionalCertificateMutation["updateProfessionalCertificate"],
      TAPI.UpdateProfessionalCertificateMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateProfessionalCertificateDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.UpdateProfessionalCertificateMutation,
      ) => response.updateProfessionalCertificate,
      invalidatesTags: CERTIFICATE_TAGS,
    }),

    setProfessionalCertificateCpdPlan: builder.mutation<
      TAPI.SetProfessionalCertificateCpdPlanMutation["setProfessionalCertificateCpdPlan"],
      TAPI.SetProfessionalCertificateCpdPlanMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.SetProfessionalCertificateCpdPlanDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.SetProfessionalCertificateCpdPlanMutation,
      ) => response.setProfessionalCertificateCpdPlan,
      invalidatesTags: CERTIFICATE_TAGS,
    }),

    deleteProfessionalCertificate: builder.mutation<
      TAPI.DeleteProfessionalCertificateMutation["deleteProfessionalCertificate"],
      TAPI.DeleteProfessionalCertificateMutationVariables
    >({
      query: (variables) => ({
        document: API.DeleteProfessionalCertificateDocument,
        variables,
      }),
      transformResponse: (
        response: TAPI.DeleteProfessionalCertificateMutation,
      ) => response.deleteProfessionalCertificate,
      invalidatesTags: CERTIFICATE_TAGS,
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

    updateProfessionalBasicProfile: builder.mutation<
      TAPI.UpdateProfessionalBasicProfileMutation["updateProfessionalBasicProfile"],
      TAPI.UpdateProfessionalBasicProfileMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateProfessionalBasicProfileDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.UpdateProfessionalBasicProfileMutation,
      ) => response.updateProfessionalBasicProfile,
      invalidatesTags: PROFILE_SECTION_TAGS,
    }),

    updateProfessionalDetails: builder.mutation<
      TAPI.UpdateProfessionalDetailsMutation["updateProfessionalDetails"],
      TAPI.UpdateProfessionalDetailsMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateProfessionalDetailsDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.UpdateProfessionalDetailsMutation) =>
        response.updateProfessionalDetails,
      invalidatesTags: PROFILE_SECTION_TAGS,
    }),

    updateProfessionalSkills: builder.mutation<
      TAPI.UpdateProfessionalSkillsMutation["updateProfessionalSkills"],
      TAPI.UpdateProfessionalSkillsMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateProfessionalSkillsDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.UpdateProfessionalSkillsMutation) =>
        response.updateProfessionalSkills,
      invalidatesTags: PROFILE_SECTION_TAGS,
    }),

    startProfessionalOnboarding: builder.mutation<
      TAPI.StartProfessionalOnboardingMutation["startProfessionalOnboarding"],
      void
    >({
      query: () => ({
        document: API.StartProfessionalOnboardingDocument,
      }),
      transformResponse: (response: TAPI.StartProfessionalOnboardingMutation) =>
        response.startProfessionalOnboarding,
    }),

    completeProfessionalOnboarding: builder.mutation<
      TAPI.CompleteProfessionalOnboardingMutation["completeProfessionalOnboarding"],
      TAPI.CompleteProfessionalOnboardingMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.CompleteProfessionalOnboardingDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.CompleteProfessionalOnboardingMutation,
      ) => response.completeProfessionalOnboarding,
      invalidatesTags: PROFILE_SECTION_TAGS,
    }),

    updateProfessionalPreferences: builder.mutation<
      TAPI.UpdateProfessionalPreferencesMutation["updateProfessionalPreferences"],
      TAPI.UpdateProfessionalPreferencesMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateProfessionalPreferencesDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.UpdateProfessionalPreferencesMutation,
      ) => response.updateProfessionalPreferences,
      invalidatesTags: PROFILE_SECTION_TAGS,
    }),

    createProfessionalCredential: builder.mutation<
      TAPI.CreateProfessionalCredentialMutation["createProfessionalCredential"],
      TAPI.CreateProfessionalCredentialMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.CreateProfessionalCredentialDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.CreateProfessionalCredentialMutation,
      ) => response.createProfessionalCredential,
      invalidatesTags: CREDENTIAL_TAGS,
    }),

    updateProfessionalCredential: builder.mutation<
      TAPI.UpdateProfessionalCredentialMutation["updateProfessionalCredential"],
      TAPI.UpdateProfessionalCredentialMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateProfessionalCredentialDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.UpdateProfessionalCredentialMutation,
      ) => response.updateProfessionalCredential,
      invalidatesTags: CREDENTIAL_TAGS,
    }),

    deleteProfessionalCredential: builder.mutation<
      TAPI.DeleteProfessionalCredentialMutation["deleteProfessionalCredential"],
      TAPI.DeleteProfessionalCredentialMutationVariables["credentialId"]
    >({
      query: (credentialId) => ({
        document: API.DeleteProfessionalCredentialDocument,
        variables: { credentialId },
      }),
      transformResponse: (
        response: TAPI.DeleteProfessionalCredentialMutation,
      ) => response.deleteProfessionalCredential,
      invalidatesTags: CREDENTIAL_TAGS,
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

    updateProfessionalPduActivity: builder.mutation<
      TAPI.UpdateProfessionalPduActivityMutation["updateProfessionalPduActivity"],
      TAPI.UpdateProfessionalPduActivityMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateProfessionalPduActivityDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.UpdateProfessionalPduActivityMutation,
      ) => response.updateProfessionalPduActivity,
      invalidatesTags: ["ProfessionalPdu", "ProfessionalOverview"],
    }),

    deleteProfessionalPduActivity: builder.mutation<
      TAPI.DeleteProfessionalPduActivityMutation["deleteProfessionalPduActivity"],
      TAPI.DeleteProfessionalPduActivityMutationVariables
    >({
      query: (variables) => ({
        document: API.DeleteProfessionalPduActivityDocument,
        variables,
      }),
      transformResponse: (
        response: TAPI.DeleteProfessionalPduActivityMutation,
      ) => response.deleteProfessionalPduActivity,
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

    /**
     * The wizard's single read. `draftId` is optional: without one the server
     * resolves the professional's own editable draft, which is what makes a
     * reload restore the conversation without the client remembering an id.
     */
    professionalRoadmapDraft: builder.query<
      TAPI.ProfessionalRoadmapDraftQuery["professionalRoadmapDraft"],
      TAPI.ProfessionalRoadmapDraftQueryVariables | void
    >({
      query: (variables) => ({
        document: API.ProfessionalRoadmapDraftDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.ProfessionalRoadmapDraftQuery) =>
        response.professionalRoadmapDraft,
      providesTags: ["ProfessionalRoadmapDraft", "Professional"],
    }),

    startRoadmapDraft: builder.mutation<
      TAPI.StartRoadmapDraftMutation["startRoadmapDraft"],
      void
    >({
      query: () => ({
        document: API.StartRoadmapDraftDocument,
      }),
      transformResponse: (response: TAPI.StartRoadmapDraftMutation) =>
        response.startRoadmapDraft,
      invalidatesTags: ["ProfessionalRoadmapDraft", "Professional"],
    }),

    /**
     * Every mutation returns the whole draft, so the cache is written from the
     * response rather than invalidated and refetched. That is what keeps the
     * transcript from flickering between the answer and the next question.
     */
    sendRoadmapChatTurn: builder.mutation<
      TAPI.SendRoadmapChatTurnMutation["sendRoadmapChatTurn"],
      TAPI.SendRoadmapChatTurnMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.SendRoadmapChatTurnDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.SendRoadmapChatTurnMutation) =>
        response.sendRoadmapChatTurn,
    }),

    patchRoadmapDraft: builder.mutation<
      TAPI.PatchRoadmapDraftMutation["patchRoadmapDraft"],
      TAPI.PatchRoadmapDraftMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.PatchRoadmapDraftDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.PatchRoadmapDraftMutation) =>
        response.patchRoadmapDraft,
    }),
  }),
});

export const {
  useMyCalendarEntriesQuery,
  usePatchRoadmapDraftMutation,
  useStartRoadmapDraftMutation,
  useSendRoadmapChatTurnMutation,
  useProfessionalRoadmapDraftQuery,
  useLazyProfessionalRoadmapDraftQuery,
  useProfessionalSettingsQuery,
  useProfessionalOverviewQuery,
  useProfessionalPaymentsQuery,
  useProfessionalPduReportQuery,
  useProfessionalMyCoursesQuery,
  useProfessionalMyRoadmapsQuery,
  useCreateCalendarEventMutation,
  useDeleteCalendarEventMutation,
  useProfessionalPduActivityQuery,
  useLazyProfessionalPaymentsQuery,
  useProfessionalCertificatesQuery,
  useProfessionalCertificateQuery,
  useLazyProfessionalSettingsQuery,
  useLazyProfessionalOverviewQuery,
  useLazyProfessionalMyCoursesQuery,
  useLazyProfessionalPduReportQuery,
  useProfessionalPduActivitiesQuery,
  useProfessionalCalendarEventsQuery,
  useLazyProfessionalPduActivityQuery,
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
  useProfessionalContentCompletionQuery,
  useProfessionalCertificateSummaryQuery,
  useProfessionalCertificateIssuersQuery,
  useProfessionalPduActivitySummaryQuery,
  useUpdateProfessionalPduActivityMutation,
  useDeleteProfessionalPduActivityMutation,
  useCreateProfessionalCertificateMutation,
  useUpdateProfessionalCertificateMutation,
  useDeleteProfessionalCertificateMutation,
  useCreateProfessionalPduActivityMutation,
  useLazyProfessionalDashboardProfileQuery,
  useSetProfessionalCertificateCpdPlanMutation,

  useProfessionalCpdPlansQuery,
  useProfessionalProfileTaxonomyQuery,
  useUpdateProfessionalSkillsMutation,
  useUpdateProfessionalDetailsMutation,
  useUpdateProfessionalBasicProfileMutation,
  useUpdateProfessionalPreferencesMutation,
  useCreateProfessionalCredentialMutation,
  useUpdateProfessionalCredentialMutation,
  useDeleteProfessionalCredentialMutation,

  useStartProfessionalOnboardingMutation,
  useCompleteProfessionalOnboardingMutation,
} = professionalApi;
