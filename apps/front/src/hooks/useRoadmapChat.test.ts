// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TRoadmapDraft } from "@/types/professional-roadmap-chat.types";

/**
 * The hook is exercised against stand-ins for the four RTK endpoints. What is
 * under test is the wizard's own behaviour — when it opens a draft, what it
 * shows while a turn is in flight, and what it keeps when one fails — not RTK.
 */
const draftState = {
  data: undefined as TRoadmapDraft | undefined,
  isLoading: false,
  isError: false,
};

const startDraft = vi.fn();
const sendTurn = vi.fn();
const patchDraft = vi.fn();
const refetchDraft = vi.fn();
const dispatch = vi.fn();

const sendingState = { isLoading: false };

vi.mock("react-redux", () => ({
  useDispatch: () => dispatch,
}));

vi.mock("@/lib/rtk/endpoints/professional.api", () => ({
  professionalApi: {
    util: {
      updateQueryData: (
        _endpoint: string,
        _args: unknown,
        recipe: () => TRoadmapDraft,
      ) => ({ type: "updateQueryData", draft: recipe() }),
    },
  },
  useProfessionalRoadmapDraftQuery: () => ({
    ...draftState,
    refetch: refetchDraft,
  }),
  useStartRoadmapDraftMutation: () => [startDraft, { isLoading: false }],
  useSendRoadmapChatTurnMutation: () => [sendTurn, sendingState],
  usePatchRoadmapDraftMutation: () => [patchDraft, { isLoading: false }],
}));

const { useRoadmapChat, readChatError } = await import("./useRoadmapChat");

const makeDraft = (overrides: Record<string, unknown> = {}): TRoadmapDraft =>
  ({
    id: "draft-1",
    status: "COLLECTING",
    currentStep: "GOAL",
    isComplete: false,
    needsClarification: false,
    wasRefused: false,
    updatedAt: "2026-08-24T00:00:00.000Z",
    goal: null,
    subjects: [],
    preferredFormats: [],
    preferredContentTypes: [],
    cpdEnabled: false,
    subjectOptions: [],
    widget: null,
    transcript: {
      totalCount: 0,
      pageInfo: { hasNextPage: false, nextCursor: null },
      items: [],
    },
    ...overrides,
  }) as unknown as TRoadmapDraft;

/** Mirrors how the GraphQL base query surfaces a server error. */
const graphqlError = (code: string, details?: Record<string, unknown>) => ({
  status: 429,
  message: code,
  errors: [{ message: code, extensions: { code, ...(details ? { details } : {}) } }],
});

const resolved = <T,>(value: T) => ({ unwrap: () => Promise.resolve(value) });
const rejected = (error: unknown) => ({
  unwrap: () => Promise.reject(error),
});

describe("useRoadmapChat", () => {
  beforeEach(() => {
    draftState.data = undefined;
    draftState.isLoading = false;
    draftState.isError = false;
    sendingState.isLoading = false;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("opening", () => {
    it("starts a draft when the professional has none", async () => {
      startDraft.mockReturnValue(resolved(makeDraft()));

      renderHook(() => useRoadmapChat());

      await waitFor(() => expect(startDraft).toHaveBeenCalledTimes(1));
    });

    it("resumes an existing draft without starting another", async () => {
      draftState.data = makeDraft({
        currentStep: "PREFERENCES",
        transcript: {
          totalCount: 1,
          pageInfo: { hasNextPage: false, nextCursor: null },
          items: [
            {
              id: "m1",
              role: "ASSISTANT",
              content: "What is your goal?",
              stepKey: "GOAL",
              createdAt: "2026-08-24T00:00:00.000Z",
              widget: null,
            },
          ],
        },
      });

      const { result } = renderHook(() => useRoadmapChat());

      expect(startDraft).not.toHaveBeenCalled();
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.draft?.currentStep).toBe("PREFERENCES");
    });

    it("does not start a second draft while the first is still opening", async () => {
      let release: ((draft: TRoadmapDraft) => void) | undefined;
      startDraft.mockReturnValue({
        unwrap: () =>
          new Promise<TRoadmapDraft>((resolve) => {
            release = resolve;
          }),
      });

      const { rerender } = renderHook(() => useRoadmapChat());
      rerender();
      rerender();

      expect(startDraft).toHaveBeenCalledTimes(1);
      await act(async () => {
        release?.(makeDraft());
      });
    });
  });

  describe("sending a turn", () => {
    beforeEach(() => {
      draftState.data = makeDraft();
    });

    it("shows the professional's message before the server answers", async () => {
      let release: ((draft: TRoadmapDraft) => void) | undefined;
      sendTurn.mockReturnValue({
        unwrap: () =>
          new Promise<TRoadmapDraft>((resolve) => {
            release = resolve;
          }),
      });

      const { result } = renderHook(() => useRoadmapChat());

      act(() => result.current.setInput("I want to become a data lead"));
      act(() => result.current.send());

      expect(result.current.pending).toEqual({
        content: "I want to become a data lead",
        failed: false,
      });
      // The input clears immediately so the next answer can be typed.
      expect(result.current.composer.value).toBe("");

      await act(async () => {
        release?.(makeDraft({ currentStep: "GOAL_REASON" }));
      });

      expect(result.current.pending).toBeNull();
    });

    it("refuses to send whitespace", () => {
      const { result } = renderHook(() => useRoadmapChat());

      act(() => result.current.setInput("   "));

      expect(result.current.canSend).toBe(false);
      act(() => result.current.send());
      expect(sendTurn).not.toHaveBeenCalled();
    });

    it("blocks a message past the length limit before it is sent", () => {
      const { result } = renderHook(() => useRoadmapChat());

      act(() => result.current.setInput("x".repeat(2001)));

      expect(result.current.composer.isOverLimit).toBe(true);
      expect(result.current.canSend).toBe(false);

      act(() => result.current.send());
      expect(sendTurn).not.toHaveBeenCalled();
    });

    it("shows the counter before the limit is reached, not after", () => {
      const { result } = renderHook(() => useRoadmapChat());

      act(() => result.current.setInput("x".repeat(1500)));
      expect(result.current.composer.showCounter).toBe(false);

      act(() => result.current.setInput("x".repeat(1850)));
      expect(result.current.composer.showCounter).toBe(true);
      expect(result.current.composer.isOverLimit).toBe(false);
    });

    it("answers from a widget through the same path as typed text", async () => {
      sendTurn.mockReturnValue(resolved(makeDraft()));

      const { result } = renderHook(() => useRoadmapChat());
      await act(async () => result.current.answerWith("EXPERT"));

      expect(sendTurn).toHaveBeenCalledWith({
        draftId: "draft-1",
        message: "EXPERT",
      });
    });
  });

  describe("a turn that fails", () => {
    beforeEach(() => {
      draftState.data = makeDraft();
    });

    it("keeps the typed text and offers a retry", async () => {
      sendTurn.mockReturnValue(rejected(graphqlError("INTERNAL_SERVER_ERROR")));

      const { result } = renderHook(() => useRoadmapChat());
      act(() => result.current.setInput("eight years in analytics"));
      await act(async () => result.current.send());

      expect(result.current.pending).toEqual({
        content: "eight years in analytics",
        failed: true,
      });
      // Nothing was retyped: the text is back in the composer.
      expect(result.current.composer.value).toBe("eight years in analytics");
      expect(result.current.turnError?.code).toBe("INTERNAL_SERVER_ERROR");
    });

    it("retries the failed message once, not the empty input", async () => {
      sendTurn.mockReturnValueOnce(rejected(graphqlError("INTERNAL_SERVER_ERROR")));

      const { result } = renderHook(() => useRoadmapChat());
      act(() => result.current.setInput("retry me"));
      await act(async () => result.current.send());

      sendTurn.mockReturnValue(resolved(makeDraft()));
      await act(async () => result.current.retry());

      expect(sendTurn).toHaveBeenCalledTimes(2);
      expect(sendTurn).toHaveBeenLastCalledWith({
        draftId: "draft-1",
        message: "retry me",
      });
      expect(result.current.pending).toBeNull();
    });

    it("holds the retry for the wait a busy service asked for", async () => {
      vi.useFakeTimers();
      sendTurn.mockReturnValue(
        rejected(graphqlError("ROADMAP_AI_BUSY", { retryAfterSeconds: 3 })),
      );

      const { result } = renderHook(() => useRoadmapChat());
      act(() => result.current.setInput("busy"));
      await act(async () => {
        result.current.send();
      });

      expect(result.current.retryAfter).toBe(3);
      expect(result.current.canSend).toBe(false);

      act(() => result.current.retry());
      expect(sendTurn).toHaveBeenCalledTimes(1);

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.retryAfter).toBe(0);
    });
  });

  describe("the review summary", () => {
    it("sends one field and takes the server's copy back", async () => {
      draftState.data = makeDraft({ isComplete: true });
      const updated = makeDraft({ goal: "become a data lead" });
      patchDraft.mockReturnValue(resolved(updated));

      const { result } = renderHook(() => useRoadmapChat());
      await act(async () => result.current.patch({ goal: "become a data lead" }));

      expect(patchDraft).toHaveBeenCalledWith({
        draftId: "draft-1",
        goal: "become a data lead",
      });
      // The client never edits its own copy — it writes what came back.
      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: "updateQueryData", draft: updated }),
      );
    });

    it("surfaces a rejected patch without losing the draft", async () => {
      draftState.data = makeDraft({ isComplete: true });
      patchDraft.mockReturnValue(rejected(graphqlError("ROADMAP_DRAFT_LOCKED")));

      const { result } = renderHook(() => useRoadmapChat());
      await act(async () => result.current.patch({ goal: "x" }));

      expect(result.current.turnError?.code).toBe("ROADMAP_DRAFT_LOCKED");
      expect(result.current.draft).not.toBeNull();
    });
  });
});

describe("readChatError", () => {
  it("reads the code and the wait a busy service asked for", () => {
    expect(
      readChatError(graphqlError("ROADMAP_AI_BUSY", { retryAfterSeconds: 12 })),
    ).toEqual({ code: "ROADMAP_AI_BUSY", retryAfterSeconds: 12 });
  });

  it("falls back to a code rather than showing a raw message", () => {
    expect(readChatError(new Error("boom"))).toEqual({
      code: "UNKNOWN",
      retryAfterSeconds: null,
    });
  });

  it("ignores a wait that is not a number", () => {
    expect(
      readChatError(graphqlError("ROADMAP_AI_BUSY", { retryAfterSeconds: null })),
    ).toEqual({ code: "ROADMAP_AI_BUSY", retryAfterSeconds: null });
  });
});
