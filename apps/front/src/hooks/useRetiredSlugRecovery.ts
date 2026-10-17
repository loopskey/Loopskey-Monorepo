"use client";

import { RECOVERY_FEEDBACK_KEY, URL_FEEDBACK_KEY } from "@/utils/content-url";
import { useAttachRetiredContentSlugMutation } from "@lib/rtk/endpoints/content-url.api";
import { RETIRED_SLUG_EVIDENCE_MIN_LENGTH } from "@/utils/content-url";
import { useEffect, useRef, useState } from "react";
import { normalizeSlugInput } from "@/utils/content-url";
import { errorCodeOf } from "@/utils/content-seo";

import type { useContentUrlEditor } from "@/hooks/useContentUrlEditor";
import type { TContentUrlFeedback } from "@/types/content-url.types";
import type { PublicPageKind } from "@/lib/content-catalog/public-path";

type TUseRetiredSlugRecoveryInput = {
  contentId: string;
  kind: PublicPageKind;
  editor: ReturnType<typeof useContentUrlEditor>;
};

export const useRetiredSlugRecovery = ({
  kind,
  editor,
  contentId,
}: TUseRetiredSlugRecoveryInput) => {
  const { t, settings, currentSlug } = editor;
  const feedbackRef = useRef<HTMLParagraphElement>(null);

  const [draft, setDraft] = useState("");
  const [evidence, setEvidence] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [feedback, setFeedback] = useState<TContentUrlFeedback | null>(null);
  const [attach, attaching] = useAttachRetiredContentSlugMutation();

  const retiredSlug = normalizeSlugInput(draft);
  const canSubmit =
    Boolean(settings) &&
    retiredSlug.length > 0 &&
    retiredSlug !== currentSlug &&
    evidence.trim().length >= RETIRED_SLUG_EVIDENCE_MIN_LENGTH &&
    isConfirmed &&
    !attaching.isLoading;

  useEffect(() => {
    if (feedback?.kind === "error") feedbackRef.current?.focus();
  }, [feedback]);

  const feedbackKey = !feedback
    ? null
    : feedback.kind === "error"
      ? (RECOVERY_FEEDBACK_KEY[feedback.code] ??
        URL_FEEDBACK_KEY[feedback.code] ??
        "contentSeo.url.recovery.feedback.failed")
      : RECOVERY_FEEDBACK_KEY.attached;

  const reset = () => {
    setFeedback(null);
    setIsConfirmed(false);
  };

  const changeDraft = (value: string) => {
    setDraft(value);
    reset();
  };

  const changeEvidence = (value: string) => {
    setEvidence(value);
    reset();
  };

  const onSubmit = async () => {
    if (!canSubmit) return;
    const result = await attach({
      kind,
      contentId,
      retiredSlug,
      expectedSlug: currentSlug,
      evidence: evidence.trim(),
    });
    if ("error" in result) {
      setFeedback({ kind: "error", code: errorCodeOf(result.error) });
      return;
    }
    setDraft("");
    setEvidence("");
    setIsConfirmed(false);
    setFeedback({ kind: "changed" });
    await editor.query.refetch();
  };

  return {
    draft,
    evidence,
    canSubmit,
    feedback,
    onSubmit,
    feedbackRef,
    isConfirmed,
    changeDraft,
    changeEvidence,
    setIsConfirmed,
    isAttaching: attaching.isLoading,
    feedbackText: feedbackKey ? t(feedbackKey) : null,
  };
};
