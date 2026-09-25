"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RoadmapDraftFieldKey, RoadmapDraftStatus } from "@/lib/graphql/base";
import { useRouter, useSearchParams } from "next/navigation";
import { ROADMAP_MESSAGE_MAX_LENGTH } from "@/utils/roadmap-chat.constant";
import { ROADMAP_COUNTER_THRESHOLD } from "@/utils/roadmap-chat.constant";
import { ROADMAP_BUSY_CODE } from "@/utils/roadmap-chat.constant";
import { roadmapChatApi } from "@/lib/rtk/endpoints/roadmap-chat.api";
import { useDispatch } from "react-redux";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as API from "@/lib/rtk/endpoints/roadmap-chat.api";
import * as T from "@/types/professional-roadmap-chat.types";

import type { PatchRoadmapCpdSetupInput } from "@/lib/graphql/base";
import type { TGraphQLBaseQueryError } from "@/types/rtk.types";
import type { PatchRoadmapDraftInput } from "@/lib/graphql/base";
import type { TAppDispatch } from "@/lib/rtk/store";

const ROADMAP_TAB_HREF = "/dashboard/professional?tab=roadmap";
const ROADMAP_CHAT_HREF = "/dashboard/professional/roadmap-chat";

const roadmapTabHref = (draftId: string) =>
  `${ROADMAP_TAB_HREF}&generationDraftId=${encodeURIComponent(draftId)}`;

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
  const searchParams = useSearchParams();
  const dispatch = useDispatch<TAppDispatch>();
  const requestedDraftId = searchParams.get("draftId")?.trim() || undefined;

  // ============= States ===============
  const [input, setInput] = useState<string>("");
  const [pending, setPending] = useState<T.TPendingMessage | null>(null);
  const [turnError, setTurnError] = useState<T.TRoadmapChatError | null>(null);
  const [retryAfter, setRetryAfter] = useState<number>(0);
  const [resetCount, setResetCount] = useState<number>(0);
  const startedRef = useRef<boolean>(false);

  const draftQueryArgs = useMemo(
    () => (requestedDraftId ? { draftId: requestedDraftId } : undefined),
    [requestedDraftId],
  );

  const {
    data: draft,
    isLoading: isDraftLoading,
    isError: isDraftError,
    refetch: refetchDraft,
  } = API.useProfessionalRoadmapDraftQuery(draftQueryArgs);

  const [startDraft, { isLoading: isStarting }] =
    API.useStartRoadmapDraftMutation();
  const [resetDraft, { isLoading: isResetting }] =
    API.useResetRoadmapDraftMutation();
  const [sendTurn, { isLoading: isSending }] =
    API.useSendRoadmapChatTurnMutation();
  const [patchDraft, { isLoading: isPatching }] =
    API.usePatchRoadmapDraftMutation();
  const [patchCpdSetupMutation, { isLoading: isPatchingCpdSetup }] =
    API.usePatchRoadmapCpdSetupMutation();
  const [requestGeneration, { isLoading: isGenerating }] =
    API.useRequestRoadmapGenerationMutation();

  const writeDraft = useCallback(
    (next: T.TRoadmapDraft) => {
      dispatch(
        roadmapChatApi.util.updateQueryData(
          "professionalRoadmapDraft",
          draftQueryArgs,
          () => next,
        ),
      );
    },
    [dispatch, draftQueryArgs],
  );

  const writeDraftEverywhere = useCallback(
    (next: T.TRoadmapDraft) => {
      writeDraft(next);
      if (draftQueryArgs)
        dispatch(
          roadmapChatApi.util.updateQueryData(
            "professionalRoadmapDraft",
            undefined,
            () => next,
          ),
        );
    },
    [dispatch, draftQueryArgs, writeDraft],
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
    async (
      changes: Omit<PatchRoadmapDraftInput, "draftId">,
      selectionLabel?: string,
    ) => {
      if (!draft) return false;
      setTurnError(null);

      try {
        const next = await patchDraft({
          draftId: draft.id,
          ...changes,
          selectionLabel: selectionLabel ?? undefined,
        }).unwrap();
        writeDraft(next);
        return true;
      } catch (error: unknown) {
        setTurnError(readChatError(error));
        return false;
      }
    },
    [draft, patchDraft, writeDraft],
  );

  const splitMulti = (value: string) =>
    value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);

  const answerWidget = useCallback(
    (value: string, label?: string) => {
      const field = draft?.widget?.field;
      if (isSending || isPatching || retryAfter > 0) return;

      if (field === RoadmapDraftFieldKey.TargetDate)
        return void patch(
          { targetDate: new Date(`${value}T00:00:00.000Z`).toISOString() },
          label,
        );
      if (field === RoadmapDraftFieldKey.CpdEnabled)
        return void patch(
          { cpdEnabled: ["true", "yes"].includes(value.trim().toLowerCase()) },
          label,
        );
      if (field === RoadmapDraftFieldKey.CertificationName)
        return void patch({ certificationName: value }, label);
      if (field === RoadmapDraftFieldKey.SkillLevel)
        return void patch({ skillLevel: value } as T.Patch, label);
      if (field === RoadmapDraftFieldKey.TimeCommitment)
        return void patch({ timeCommitment: value } as T.Patch, label);
      if (field === RoadmapDraftFieldKey.BudgetPreference)
        return void patch({ budgetPreference: value } as T.Patch, label);
      if (field === RoadmapDraftFieldKey.Subjects)
        return void patch(
          { subjects: splitMulti(value) } as T.Patch,
          label,
        );
      if (field === RoadmapDraftFieldKey.PreferredFormats)
        return void patch(
          { preferredFormats: splitMulti(value) } as T.Patch,
          label,
        );
      if (field === RoadmapDraftFieldKey.PreferredDeliveryFormats)
        return void patch(
          { preferredDeliveryFormats: splitMulti(value) } as T.Patch,
          label,
        );
      answerWith(value);
    },
    [
      answerWith,
      draft?.widget?.field,
      isPatching,
      isSending,
      patch,
      retryAfter,
    ],
  );

  const patchCpdSetup = useCallback(
    async (changes: Omit<PatchRoadmapCpdSetupInput, "draftId">) => {
      if (!draft) return;
      setTurnError(null);

      try {
        const next = await patchCpdSetupMutation({
          draftId: draft.id,
          ...changes,
        }).unwrap();
        writeDraft(next);
      } catch (error: unknown) {
        setTurnError(readChatError(error));
      }
    },
    [draft, patchCpdSetupMutation, writeDraft],
  );

  const startOver = useCallback(async () => {
    setTurnError(null);
    setPending(null);
    setRetryAfter(0);
    setInput("");

    try {
      const next = await resetDraft(draft?.id).unwrap();
      writeDraftEverywhere(next);
      setResetCount((count) => count + 1);
      if (requestedDraftId) router.replace(ROADMAP_CHAT_HREF);
      return true;
    } catch (error: unknown) {
      setTurnError(readChatError(error));
      notify.error(t("professionalRoadmapChat.startOverFailed"));
      return false;
    }
  }, [
    draft?.id,
    requestedDraftId,
    resetDraft,
    router,
    t,
    writeDraftEverywhere,
  ]);

  const generate = useCallback(async () => {
    if (!draft || draft.status === RoadmapDraftStatus.Generating) return;
    try {
      const next = await requestGeneration(draft.id).unwrap();
      writeDraft(next);
      router.push(roadmapTabHref(next.id));
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
    startOver,
    isSending,
    turnError,
    isPatching,
    retryAfter,
    resetCount,
    isResetting,
    refetchDraft,
    isDraftError,
    isGenerating,
    answerWidget,
    patchCpdSetup,
    dismissPending,
    isPatchingCpdSetup,
    draft: draft ?? null,
    widget: draft?.widget ?? null,
    isLoading: isDraftLoading || isStarting,
  };
};
