"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ROADMAP_MESSAGE_MAX_LENGTH } from "@/utils/roadmap-chat.constant";
import { ROADMAP_COUNTER_THRESHOLD } from "@/utils/roadmap-chat.constant";
import { RoadmapDraftStatus } from "@/lib/graphql/base";
import { ROADMAP_BUSY_CODE } from "@/utils/roadmap-chat.constant";
import { roadmapChatApi } from "@/lib/rtk/endpoints/roadmap-chat.api";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as API from "@/lib/rtk/endpoints/roadmap-chat.api";
import * as T from "@/types/professional-roadmap-chat.types";

import type { PatchRoadmapDraftInput } from "@/lib/graphql/base";
import type { TAppDispatch } from "@/lib/rtk/store";
import type { TGraphQLBaseQueryError } from "@/types/rtk.types";

const ROADMAP_TAB_HREF = "/dashboard/professional?tab=roadmap";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

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
  const { t } = useI18n();
  const router = useRouter();
  const dispatch = useDispatch<TAppDispatch>();

  // ============= States ===============
  const [input, setInput] = useState<string>("");
  const [pending, setPending] = useState<T.TPendingMessage | null>(null);
  const [turnError, setTurnError] = useState<T.TRoadmapChatError | null>(null);
  const [retryAfter, setRetryAfter] = useState<number>(0);
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
  const [requestGeneration, { isLoading: isGenerating }] =
    API.useRequestRoadmapGenerationMutation();

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

  const generate = useCallback(async () => {
    if (!draft || draft.status === RoadmapDraftStatus.Generating) return;
    try {
      const next = await requestGeneration(draft.id).unwrap();
      writeDraft(next);
      router.push(ROADMAP_TAB_HREF);
    } catch {
      notify.error(t("professionalRoadmapChat.review.generateFailed"));
    }
  }, [draft, requestGeneration, router, t, writeDraft]);

  return {
    send,
    retry,
    patch,
    pending,
    canSend,
    messages,
    setInput,
    composer,
    generate,
    isSending,
    turnError,
    answerWith,
    isPatching,
    retryAfter,
    refetchDraft,
    isDraftError,
    isGenerating,
    dismissPending,
    draft: draft ?? null,
    widget: draft?.widget ?? null,
    isLoading: isDraftLoading || isStarting,
  };
};
