import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";
import * as API from "@/lib/graphql/generated";

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
  useCpdPlanProgressQuery,
  useCreateCpdPlanMutation,
  useUpdateCpdPlanMutation,
  useDeleteCpdPlanMutation,
  useCertificationSearchQuery,
  useCpdReportRecipientsQuery,
  useLazyCertificationSearchQuery,
  useCreateCpdPlanFromSuggestionMutation,
} = cpdPlanApi;
