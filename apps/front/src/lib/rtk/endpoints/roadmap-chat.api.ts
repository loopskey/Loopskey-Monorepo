import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";
import * as API from "@/lib/graphql/operations/roadmap-chat";

export const roadmapChatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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

    resetRoadmapDraft: builder.mutation<
      TAPI.ResetRoadmapDraftMutation["resetRoadmapDraft"],
      string | void
    >({
      query: (draftId) => ({
        document: API.ResetRoadmapDraftDocument,
        variables: { draftId: draftId ?? undefined },
      }),
      transformResponse: (response: TAPI.ResetRoadmapDraftMutation) =>
        response.resetRoadmapDraft,
      invalidatesTags: ["ProfessionalRoadmapDraft", "Professional"],
    }),

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

    patchRoadmapCpdSetup: builder.mutation<
      TAPI.PatchRoadmapCpdSetupMutation["patchRoadmapCpdSetup"],
      TAPI.PatchRoadmapCpdSetupMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.PatchRoadmapCpdSetupDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.PatchRoadmapCpdSetupMutation) =>
        response.patchRoadmapCpdSetup,
    }),

    requestRoadmapGeneration: builder.mutation<
      TAPI.RequestRoadmapGenerationMutation["requestRoadmapGeneration"],
      TAPI.RequestRoadmapGenerationMutationVariables["draftId"]
    >({
      query: (draftId) => ({
        document: API.RequestRoadmapGenerationDocument,
        variables: { draftId },
      }),
      transformResponse: (response: TAPI.RequestRoadmapGenerationMutation) =>
        response.requestRoadmapGeneration,
      invalidatesTags: [
        "ProfessionalRoadmapDraft",
        "ProfessionalRoadmaps",
        "ProfessionalRoadmapStats",
        "Professional",
      ],
    }),

    roadmapSuggestionOptions: builder.query<
      TAPI.RoadmapSuggestionOptionsQuery["roadmapSuggestionOptions"],
      TAPI.RoadmapSuggestionOptionsQueryVariables["input"]
    >({
      query: (input) => ({
        document: API.RoadmapSuggestionOptionsDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.RoadmapSuggestionOptionsQuery) =>
        response.roadmapSuggestionOptions,
    }),
  }),
});

export const {
  usePatchRoadmapDraftMutation,
  useStartRoadmapDraftMutation,
  useResetRoadmapDraftMutation,
  useSendRoadmapChatTurnMutation,
  usePatchRoadmapCpdSetupMutation,
  useProfessionalRoadmapDraftQuery,
  useRequestRoadmapGenerationMutation,
  useLazyProfessionalRoadmapDraftQuery,
  useLazyRoadmapSuggestionOptionsQuery,
} = roadmapChatApi;
