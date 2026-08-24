import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";
import * as API from "@/lib/graphql/operations/roadmap-chat";

/**
 * The wizard's operations live in their own domain module rather than with the
 * rest of the professional surface.
 *
 * `professional.api.ts` is loaded by every dashboard route, and it imports its
 * operations as a namespace — so a document added there is downloaded by the
 * overview, courses and settings tabs too. Keeping these four here means only
 * the chat route pays for them.
 */
export const roadmapChatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
  usePatchRoadmapDraftMutation,
  useStartRoadmapDraftMutation,
  useSendRoadmapChatTurnMutation,
  useProfessionalRoadmapDraftQuery,
  useLazyProfessionalRoadmapDraftQuery,
} = roadmapChatApi;
