"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";

import {
  ROADMAP_BUSY_CODE,
  ROADMAP_COUNTER_THRESHOLD,
  ROADMAP_MESSAGE_MAX_LENGTH,
} from "@/utils/roadmap-chat.constant";
import { roadmapChatApi } from "@/lib/rtk/endpoints/roadmap-chat.api";

import * as API from "@/lib/rtk/endpoints/roadmap-chat.api";
import * as T from "@/types/professional-roadmap-chat.types";

import type { PatchRoadmapDraftInput } from "@/lib/graphql/base";
import type { TAppDispatch } from "@/lib/rtk/store";
import type { TGraphQLBaseQueryError } from "@/types/rtk.types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/**
 * The server sends a stable code plus, for a busy service, the wait it wants.
 * Anything it does not recognise still produces a code so the UI has something
 * to translate rather than showing a raw message.
 */
export const readChatError = (error: unknown): T.TRoadmapChatError => {
  const graphql = error as TGraphQLBaseQueryError | undefined;
  const first = graphql?.errors?.[0];
  const extensions = first?.extensions;
  const details = isRecord(extensions?.details) ? extensions.details : null;
  const retryAfter = details?.retryAfterSeconds;

  return {
    code: extensions?.code ?? "UNKNOWN",
    retryAfterSeconds: typeof retryAfter === "number" ? retryAfter : null,
  };
};

export const useRoadmapChat = () => {
  const dispatch = useDispatch<TAppDispatch>();

  // ============= States ===============
  const [input, setInput] = useState<string>("");
  const [pending, setPending] = useState<T.TPendingMessage | null>(null);
  const [turnError, setTurnError] = useState<T.TRoadmapChatError | null>(null);
  const [retryAfter, setRetryAfter] = useState<number>(0);

  /** Guards the one-shot start so a slow mutation cannot open two drafts. */
  const startedRef = useRef<boolean>(false);

  const {
    data: draft,
    isLoading: isDraftLoading,
    isError: isDraftError,
    refetch: refetchDraft,
  } = API.useProfessionalRoadmapDraftQuery();

  const [startDraft, { isLoading: isStarting }] =
    API.useStartRoadmapDraftMutation();
  const [sendTurn, { isLoading: isSending }] =
    API.useSendRoadmapChatTurnMutation();
  const [patchDraft, { isLoading: isPatching }] =
    API.usePatchRoadmapDraftMutation();

  /**
   * Every mutation returns the whole draft, so the response is written into the
   * query cache rather than invalidating it. Refetching instead would blank the
   * transcript between the answer and the next question.
   */
  const writeDraft = useCallback(
    (next: T.TRoadmapDraft) => {
      dispatch(
        roadmapChatApi.util.updateQueryData(
          "professionalRoadmapDraft",
          undefined,
          () => next,
        ),
      );
    },
    [dispatch],
  );

  // ============= Opening the wizard ===============
  useEffect(() => {
    if (isDraftLoading || isDraftError) return;
    if (draft || startedRef.current) return;

    startedRef.current = true;
    void startDraft()
      .unwrap()
      .then(writeDraft)
      .catch((error: unknown) => {
        // Let the professional try again rather than stranding the route.
        startedRef.current = false;
        setTurnError(readChatError(error));
      });
  }, [draft, isDraftError, isDraftLoading, startDraft, writeDraft]);

  // ============= Busy countdown ===============
  useEffect(() => {
    if (retryAfter <= 0) return;
    const timer = window.setInterval(
      () => setRetryAfter((seconds) => Math.max(0, seconds - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [retryAfter]);

  // ============= Use Memo =============
  const composer = useMemo<T.TComposerState>(() => {
    const remaining = ROADMAP_MESSAGE_MAX_LENGTH - input.length;

    return {
      value: input,
      remaining,
      isOverLimit: remaining < 0,
      showCounter: remaining <= ROADMAP_COUNTER_THRESHOLD,
    };
  }, [input]);

  const canSend = useMemo<boolean>(() => {
    if (!draft || isSending) return false;
    if (retryAfter > 0) return false;
    if (composer.isOverLimit) return false;
    return input.trim().length > 0;
  }, [composer.isOverLimit, draft, input, isSending, retryAfter]);

  /**
   * The persisted transcript plus the message in flight. The pending entry is
   * dropped the moment the server's copy arrives, so a message is never shown
   * twice.
   */
  const messages = useMemo<T.TRoadmapChatMessage[]>(
    () => draft?.transcript.items ?? [],
    [draft?.transcript.items],
  );

  // ============= Handlers =============
  const submit = useCallback(
    async (message: string) => {
      if (!draft) return;
      const content = message.trim();
      if (!content) return;

      setTurnError(null);
      setPending({ content, failed: false });
      setInput("");

      try {
        const next = await sendTurn({
          draftId: draft.id,
          message: content,
        }).unwrap();

        writeDraft(next);
        setPending(null);
      } catch (error: unknown) {
        const parsed = readChatError(error);
        setTurnError(parsed);
        setPending({ content, failed: true });
        // The typed text comes back so a retry costs no re-typing.
        setInput(content);
        if (parsed.code === ROADMAP_BUSY_CODE && parsed.retryAfterSeconds)
          setRetryAfter(parsed.retryAfterSeconds);
      }
    },
    [draft, sendTurn, writeDraft],
  );

  const send = useCallback(() => {
    if (!canSend) return;
    void submit(input);
  }, [canSend, input, submit]);

  /** Answering with a widget skips the textarea but takes the same path. */
  const answerWith = useCallback(
    (value: string) => {
      if (!draft || isSending || retryAfter > 0) return;
      void submit(value);
    },
    [draft, isSending, retryAfter, submit],
  );

  const retry = useCallback(() => {
    if (!pending?.failed || retryAfter > 0) return;
    void submit(pending.content);
  }, [pending, retryAfter, submit]);

  const dismissPending = useCallback(() => {
    setPending(null);
    setTurnError(null);
  }, []);

  /**
   * The summary never edits its own copy: it sends one field and re-renders
   * from whatever the server returns, which is also what records the change in
   * the transcript.
   */
  const patch = useCallback(
    async (changes: Omit<PatchRoadmapDraftInput, "draftId">) => {
      if (!draft) return;
      setTurnError(null);

      try {
        const next = await patchDraft({
          draftId: draft.id,
          ...changes,
        }).unwrap();
        writeDraft(next);
      } catch (error: unknown) {
        setTurnError(readChatError(error));
      }
    },
    [draft, patchDraft, writeDraft],
  );

  return {
    draft: draft ?? null,
    messages,
    pending,
    widget: draft?.widget ?? null,
    composer,
    turnError,
    retryAfter,
    canSend,
    isLoading: isDraftLoading || isStarting,
    isDraftError,
    isSending,
    isPatching,
    setInput,
    send,
    answerWith,
    retry,
    dismissPending,
    patch,
    refetchDraft,
  };
};
