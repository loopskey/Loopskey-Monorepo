import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";
import * as API from "@/lib/graphql/operations/ingestion";

export const ingestionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    ingestionSources: builder.query<
      TAPI.IngestionSourcesQuery["ingestionSources"],
      TAPI.IngestionSourcesQueryVariables | void
    >({
      query: (variables) => ({
        document: API.IngestionSourcesDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.IngestionSourcesQuery) =>
        response.ingestionSources,
      providesTags: ["IngestionSources"],
    }),

    ingestionSource: builder.query<
      TAPI.IngestionSourceQuery["ingestionSource"],
      TAPI.IngestionSourceQueryVariables["sourceId"]
    >({
      query: (sourceId) => ({
        document: API.IngestionSourceDocument,
        variables: { sourceId },
      }),
      transformResponse: (response: TAPI.IngestionSourceQuery) =>
        response.ingestionSource,
      providesTags: (_result, _error, sourceId) => [
        { type: "IngestionSource", id: sourceId },
      ],
    }),

    createIngestionSource: builder.mutation<
      TAPI.CreateIngestionSourceMutation["createIngestionSource"],
      TAPI.CreateIngestionSourceMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.CreateIngestionSourceDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.CreateIngestionSourceMutation) =>
        response.createIngestionSource,
      invalidatesTags: ["IngestionSources"],
    }),

    updateIngestionSource: builder.mutation<
      TAPI.UpdateIngestionSourceMutation["updateIngestionSource"],
      TAPI.UpdateIngestionSourceMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateIngestionSourceDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.UpdateIngestionSourceMutation) =>
        response.updateIngestionSource,
      invalidatesTags: (_result, _error, input) => [
        "IngestionSources",
        { type: "IngestionSource", id: input.sourceId },
      ],
    }),

    activateIngestionSource: builder.mutation<
      TAPI.ActivateIngestionSourceMutation["activateIngestionSource"],
      TAPI.ActivateIngestionSourceMutationVariables["sourceId"]
    >({
      query: (sourceId) => ({
        document: API.ActivateIngestionSourceDocument,
        variables: { sourceId },
      }),
      transformResponse: (response: TAPI.ActivateIngestionSourceMutation) =>
        response.activateIngestionSource,
      invalidatesTags: (_result, _error, sourceId) => [
        "IngestionSources",
        { type: "IngestionSource", id: sourceId },
      ],
    }),

    deactivateIngestionSource: builder.mutation<
      TAPI.DeactivateIngestionSourceMutation["deactivateIngestionSource"],
      TAPI.DeactivateIngestionSourceMutationVariables["sourceId"]
    >({
      query: (sourceId) => ({
        document: API.DeactivateIngestionSourceDocument,
        variables: { sourceId },
      }),
      transformResponse: (response: TAPI.DeactivateIngestionSourceMutation) =>
        response.deactivateIngestionSource,
      invalidatesTags: (_result, _error, sourceId) => [
        "IngestionSources",
        { type: "IngestionSource", id: sourceId },
      ],
    }),

    ingestionApiKeys: builder.query<
      TAPI.IngestionApiKeysQuery["ingestionApiKeys"],
      TAPI.IngestionApiKeysQueryVariables["sourceId"]
    >({
      query: (sourceId) => ({
        document: API.IngestionApiKeysDocument,
        variables: { sourceId },
      }),
      transformResponse: (response: TAPI.IngestionApiKeysQuery) =>
        response.ingestionApiKeys,
      providesTags: (_result, _error, sourceId) => [
        { type: "IngestionApiKeys", id: sourceId },
      ],
    }),

    issueIngestionApiKey: builder.mutation<
      TAPI.IssueIngestionApiKeyMutation["issueIngestionApiKey"],
      TAPI.IssueIngestionApiKeyMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.IssueIngestionApiKeyDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.IssueIngestionApiKeyMutation) =>
        response.issueIngestionApiKey,
      invalidatesTags: (_result, _error, input) => [
        { type: "IngestionApiKeys", id: input.sourceId },
      ],
    }),

    revokeIngestionApiKey: builder.mutation<
      TAPI.RevokeIngestionApiKeyMutation["revokeIngestionApiKey"],
      TAPI.RevokeIngestionApiKeyMutationVariables["keyId"]
    >({
      query: (keyId) => ({
        document: API.RevokeIngestionApiKeyDocument,
        variables: { keyId },
      }),
      transformResponse: (response: TAPI.RevokeIngestionApiKeyMutation) =>
        response.revokeIngestionApiKey,
      invalidatesTags: (result) =>
        result ? [{ type: "IngestionApiKeys", id: result.sourceId }] : [],
    }),

    ingestionBatches: builder.query<
      TAPI.IngestionBatchesQuery["ingestionBatches"],
      TAPI.IngestionBatchesQueryVariables
    >({
      query: (variables) => ({
        document: API.IngestionBatchesDocument,
        variables,
      }),
      transformResponse: (response: TAPI.IngestionBatchesQuery) =>
        response.ingestionBatches,
      providesTags: (_result, _error, variables) => [
        { type: "IngestionBatches", id: variables.sourceId },
      ],
    }),

    ingestionBatch: builder.query<
      TAPI.IngestionBatchQuery["ingestionBatch"],
      TAPI.IngestionBatchQueryVariables["batchId"]
    >({
      query: (batchId) => ({
        document: API.IngestionBatchDocument,
        variables: { batchId },
      }),
      transformResponse: (response: TAPI.IngestionBatchQuery) =>
        response.ingestionBatch,
    }),

    ingestionItems: builder.query<
      TAPI.IngestionItemsQuery["ingestionItems"],
      TAPI.IngestionItemsQueryVariables | void
    >({
      query: (variables) => ({
        document: API.IngestionItemsDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.IngestionItemsQuery) =>
        response.ingestionItems,
      providesTags: ["IngestionItems"],
    }),

    approveIngestionItem: builder.mutation<
      TAPI.ApproveIngestionItemMutation["approveIngestionItem"],
      TAPI.ApproveIngestionItemMutationVariables["itemId"]
    >({
      query: (itemId) => ({
        document: API.ApproveIngestionItemDocument,
        variables: { itemId },
      }),
      transformResponse: (response: TAPI.ApproveIngestionItemMutation) =>
        response.approveIngestionItem,
      invalidatesTags: ["IngestionItems"],
    }),

    rejectIngestionItem: builder.mutation<
      TAPI.RejectIngestionItemMutation["rejectIngestionItem"],
      TAPI.RejectIngestionItemMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.RejectIngestionItemDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.RejectIngestionItemMutation) =>
        response.rejectIngestionItem,
      invalidatesTags: ["IngestionItems"],
    }),
  }),
});

export const {
  useIngestionSourcesQuery,
  useLazyIngestionSourcesQuery,
  useIngestionSourceQuery,
  useLazyIngestionSourceQuery,
  useCreateIngestionSourceMutation,
  useUpdateIngestionSourceMutation,
  useActivateIngestionSourceMutation,
  useDeactivateIngestionSourceMutation,
  useIngestionApiKeysQuery,
  useLazyIngestionApiKeysQuery,
  useIssueIngestionApiKeyMutation,
  useRevokeIngestionApiKeyMutation,
  useIngestionBatchesQuery,
  useLazyIngestionBatchesQuery,
  useIngestionBatchQuery,
  useLazyIngestionBatchQuery,
  useIngestionItemsQuery,
  useLazyIngestionItemsQuery,
  useApproveIngestionItemMutation,
  useRejectIngestionItemMutation,
} = ingestionApi;
