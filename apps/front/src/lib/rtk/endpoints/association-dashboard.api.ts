import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";
import * as API from "@/lib/graphql/operations/association-dashboard";

export const associationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    associationProfile: builder.query<
      TAPI.AssociationProfileQuery["associationProfile"],
      void
    >({
      query: () => ({
        document: API.AssociationProfileDocument,
      }),
      transformResponse: (response: TAPI.AssociationProfileQuery) =>
        response.associationProfile,
      providesTags: ["AssociationProfile", "Association"],
    }),

    updateAssociationProfile: builder.mutation<
      TAPI.UpdateAssociationProfileMutation["updateAssociationProfile"],
      TAPI.UpdateAssociationProfileMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateAssociationProfileDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.UpdateAssociationProfileMutation) =>
        response.updateAssociationProfile,
      invalidatesTags: ["AssociationProfile", "Association"],
    }),

    createAssociationAccount: builder.mutation<
      TAPI.CreateAssociationAccountMutation["createAssociationAccount"],
      TAPI.CreateAssociationAccountMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.CreateAssociationAccountDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.CreateAssociationAccountMutation) =>
        response.createAssociationAccount,
      invalidatesTags: ["Association"],
    }),

    resendAssociationActivation: builder.mutation<
      TAPI.ResendAssociationActivationMutation["resendAssociationActivation"],
      TAPI.ResendAssociationActivationMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.ResendAssociationActivationDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.ResendAssociationActivationMutation,
      ) => response.resendAssociationActivation,
    }),
  }),
});

export const {
  useAssociationProfileQuery,
  useUpdateAssociationProfileMutation,
  useCreateAssociationAccountMutation,
  useResendAssociationActivationMutation,
} = associationApi;
