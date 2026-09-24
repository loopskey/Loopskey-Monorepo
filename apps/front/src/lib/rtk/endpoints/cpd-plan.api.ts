import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";
import * as API from "@/lib/graphql/operations/cpd-plan";

/**
 * The requirement and plan queries drive `Log activity` prefill and the
 * Requirements tab, and the dashboard shell keeps its components mounted
 * across tab-only navigations. Without this, an association assigning a
 * requirement, or the professional switching tabs, leaves these endpoints
 * serving a stale option list until a full reload.
 */
export const REQUIREMENT_QUERY_SUBSCRIPTION_OPTIONS = {
  refetchOnMountOrArgChange: true,
  refetchOnFocus: true,
} as const;

const CPD_PLAN_TAGS = [
  "ProfessionalCpdPlan",
  "ProfessionalOverview",
  "Professional",
] as const;

export const cpdPlanApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    certificationSearch: builder.query<
      TAPI.CertificationSearchQuery["certificationSearch"],
      TAPI.CertificationSearchQueryVariables
    >({
      query: (variables) => ({
        document: API.CertificationSearchDocument,
        variables,
      }),
      transformResponse: (response: TAPI.CertificationSearchQuery) =>
        response.certificationSearch,
    }),

    myCpdPlans: builder.query<TAPI.MyCpdPlansQuery["myCpdPlans"], void>({
      query: () => ({ document: API.MyCpdPlansDocument }),
      transformResponse: (response: TAPI.MyCpdPlansQuery) =>
        response.myCpdPlans,
      providesTags: ["ProfessionalCpdPlan", "Professional"],
    }),

    myDraftCpdPlans: builder.query<
      TAPI.MyDraftCpdPlansQuery["myDraftCpdPlans"],
      void
    >({
      query: () => ({ document: API.MyDraftCpdPlansDocument }),
      transformResponse: (response: TAPI.MyDraftCpdPlansQuery) =>
        response.myDraftCpdPlans,
      providesTags: ["ProfessionalCpdPlan", "Professional"],
    }),

    cpdPlan: builder.query<
      TAPI.CpdPlanQuery["cpdPlan"],
      TAPI.CpdPlanQueryVariables
    >({
      query: (variables) => ({ document: API.CpdPlanDocument, variables }),
      transformResponse: (response: TAPI.CpdPlanQuery) => response.cpdPlan,
      providesTags: ["ProfessionalCpdPlan", "Professional"],
    }),

    cpdPlanProgress: builder.query<
      TAPI.CpdPlanProgressQuery["cpdPlanProgress"],
      TAPI.CpdPlanProgressQueryVariables
    >({
      query: (variables) => ({
        document: API.CpdPlanProgressDocument,
        variables,
      }),
      transformResponse: (response: TAPI.CpdPlanProgressQuery) =>
        response.cpdPlanProgress,
      providesTags: ["ProfessionalCpdPlan", "ProfessionalPdu", "Professional"],
    }),

    cpdPlanActivities: builder.query<
      TAPI.CpdPlanActivitiesQuery["cpdPlanActivities"],
      TAPI.CpdPlanActivitiesQueryVariables
    >({
      query: (variables) => ({
        document: API.CpdPlanActivitiesDocument,
        variables,
      }),
      transformResponse: (response: TAPI.CpdPlanActivitiesQuery) =>
        response.cpdPlanActivities,
      providesTags: ["ProfessionalCpdPlan", "ProfessionalPdu", "Professional"],
    }),

    myAssociationRequirements: builder.query<
      TAPI.MyAssociationRequirementsQuery["myAssociationRequirements"],
      void
    >({
      query: () => ({ document: API.MyAssociationRequirementsDocument }),
      transformResponse: (response: TAPI.MyAssociationRequirementsQuery) =>
        response.myAssociationRequirements,
      providesTags: ["ProfessionalCpdPlan", "ProfessionalPdu", "Professional"],
    }),

    myAssociationRequirement: builder.query<
      TAPI.MyAssociationRequirementQuery["myAssociationRequirement"],
      TAPI.MyAssociationRequirementQueryVariables
    >({
      query: (variables) => ({
        document: API.MyAssociationRequirementDocument,
        variables,
      }),
      transformResponse: (response: TAPI.MyAssociationRequirementQuery) =>
        response.myAssociationRequirement,
      providesTags: ["ProfessionalCpdPlan", "ProfessionalPdu", "Professional"],
    }),

    cpdReportRecipients: builder.query<
      TAPI.CpdReportRecipientsQuery["cpdReportRecipients"],
      void
    >({
      query: () => ({ document: API.CpdReportRecipientsDocument }),
      transformResponse: (response: TAPI.CpdReportRecipientsQuery) =>
        response.cpdReportRecipients,
      providesTags: ["ProfessionalCpdPlan", "Professional"],
    }),

    createCpdPlan: builder.mutation<
      TAPI.CreateCpdPlanMutation["createCpdPlan"],
      TAPI.CreateCpdPlanMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.CreateCpdPlanDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.CreateCpdPlanMutation) =>
        response.createCpdPlan,
      invalidatesTags: CPD_PLAN_TAGS,
    }),

    createCpdPlanFromSuggestion: builder.mutation<
      TAPI.CreateCpdPlanFromSuggestionMutation["createCpdPlanFromSuggestion"],
      TAPI.CreateCpdPlanFromSuggestionMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.CreateCpdPlanFromSuggestionDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.CreateCpdPlanFromSuggestionMutation) =>
        response.createCpdPlanFromSuggestion,
      invalidatesTags: CPD_PLAN_TAGS,
    }),

    activateCpdPlan: builder.mutation<
      TAPI.ActivateCpdPlanMutation["activateCpdPlan"],
      TAPI.ActivateCpdPlanMutationVariables["planId"]
    >({
      query: (planId) => ({
        document: API.ActivateCpdPlanDocument,
        variables: { planId },
      }),
      transformResponse: (response: TAPI.ActivateCpdPlanMutation) =>
        response.activateCpdPlan,
      invalidatesTags: CPD_PLAN_TAGS,
    }),

    updateCpdPlan: builder.mutation<
      TAPI.UpdateCpdPlanMutation["updateCpdPlan"],
      TAPI.UpdateCpdPlanMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateCpdPlanDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.UpdateCpdPlanMutation) =>
        response.updateCpdPlan,
      invalidatesTags: CPD_PLAN_TAGS,
    }),

    deleteCpdPlan: builder.mutation<
      TAPI.DeleteCpdPlanMutation["deleteCpdPlan"],
      TAPI.DeleteCpdPlanMutationVariables["planId"]
    >({
      query: (planId) => ({
        document: API.DeleteCpdPlanDocument,
        variables: { planId },
      }),
      transformResponse: (response: TAPI.DeleteCpdPlanMutation) =>
        response.deleteCpdPlan,
      invalidatesTags: CPD_PLAN_TAGS,
    }),
  }),
});

export const {
  useCpdPlanQuery,
  useMyCpdPlansQuery,
  useMyDraftCpdPlansQuery,
  useCpdPlanProgressQuery,
  useCpdPlanActivitiesQuery,
  useMyAssociationRequirementQuery,
  useMyAssociationRequirementsQuery,
  useCreateCpdPlanMutation,
  useActivateCpdPlanMutation,
  useUpdateCpdPlanMutation,
  useDeleteCpdPlanMutation,
  useCertificationSearchQuery,
  useCpdReportRecipientsQuery,
  useLazyCertificationSearchQuery,
  useCreateCpdPlanFromSuggestionMutation,
} = cpdPlanApi;
