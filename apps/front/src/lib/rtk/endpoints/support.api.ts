import { SubmitContactInquiryDocument } from "@/lib/graphql/operations/support";
import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitContactInquiry: builder.mutation<
      TAPI.SubmitContactInquiryMutation["submitContactInquiry"],
      TAPI.SubmitContactInquiryMutationVariables["input"]
    >({
      query: (input) => ({
        document: SubmitContactInquiryDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.SubmitContactInquiryMutation) =>
        response.submitContactInquiry,
    }),
  }),
});

export const { useSubmitContactInquiryMutation } = supportApi;
