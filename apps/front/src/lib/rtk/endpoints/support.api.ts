import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";
import * as API from "@/lib/graphql/generated";

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitContactInquiry: builder.mutation<
      TAPI.SubmitContactInquiryMutation["submitContactInquiry"],
      TAPI.SubmitContactInquiryMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.SubmitContactInquiryDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.SubmitContactInquiryMutation) =>
        response.submitContactInquiry,
    }),
  }),
});

export const { useSubmitContactInquiryMutation } = supportApi;
