"use client";

import { URL_FEEDBACK_KEY, normalizeSlugInput } from "@/utils/content-url";
import { useChangeContentSlugMutation } from "@lib/rtk/endpoints/content-url.api";
import { useEffect, useRef, useState } from "react";
import { previewCanonicalUrl } from "@/utils/content-seo";
import { useContentUrlQuery } from "@lib/rtk/endpoints/content-url.api";
import { AppLanguage } from "@/lib/graphql/base";
import { errorCodeOf } from "@/utils/content-seo";
import { useI18n } from "@/hooks/useI18n";

import type { TContentUrlFeedback } from "@/types/content-url.types";
import type { TContentUrlSettings } from "@/types/content-url.types";
import type { ContentKind } from "@/lib/content-catalog/detail-path";

type TUseContentUrlEditorInput = {
  kind: ContentKind;
  contentId: string;
  slug?: string;
  isEnabled: boolean;
};

export const useContentUrlEditor = ({
  kind,
  contentId,
  slug,
  isEnabled,
}: TUseContentUrlEditorInput) => {
  const { t } = useI18n();
  const feedbackRef = useRef<HTMLParagraphElement>(null);

  const [draft, setDraft] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [saved, setSaved] = useState<TContentUrlSettings | null>(null);
  const [feedback, setFeedback] = useState<TContentUrlFeedback | null>(null);

  const query = useContentUrlQuery(
    { kind, contentId },
    { skip: !isEnabled, refetchOnMountOrArgChange: true },
  );
  const [changeSlug, changing] = useChangeContentSlugMutation();

  const settings = saved ?? query.data ?? null;
  const currentSlug = settings?.slug ?? slug ?? "";
  const proposedSlug = normalizeSlugInput(draft);
  const isDirty = proposedSlug !== currentSlug;
  const canSubmit =
    Boolean(settings) &&
    isDirty &&
    proposedSlug.length > 0 &&
    isConfirmed &&
    !changing.isLoading;

  useEffect(() => {
    if (query.data) setSaved(null);
  }, [query.data]);

  useEffect(() => {
    setDraft(currentSlug);
    setIsConfirmed(false);
  }, [currentSlug]);

  useEffect(() => {
    if (feedback?.kind === "error") feedbackRef.current?.focus();
  }, [feedback]);

  const feedbackText = feedback
    ? t(
        URL_FEEDBACK_KEY[
          feedback.kind === "error" ? feedback.code : feedback.kind
        ] ?? "contentSeo.url.feedback.failed",
      )
    : null;

  const previewSlug = proposedSlug || currentSlug;
  const previews = {
    current: previewCanonicalUrl(kind, currentSlug, AppLanguage.En),
    english: previewCanonicalUrl(kind, previewSlug, AppLanguage.En),
    french: previewCanonicalUrl(kind, previewSlug, AppLanguage.Fr),
  };

  const changeDraft = (value: string) => {
    setDraft(value);
    setIsConfirmed(false);
    setFeedback(null);
  };

  const onSubmit = async () => {
    if (!canSubmit) return;
    const result = await changeSlug({
      kind,
      contentId,
      slug: proposedSlug,
      expectedSlug: currentSlug,
    });
    if ("error" in result) {
      setFeedback({ kind: "error", code: errorCodeOf(result.error) });
      return;
    }
    setSaved(result.data);
    setFeedback({ kind: "changed" });
  };

  const onReload = async () => {
    setSaved(null);
    await query.refetch();
    setFeedback(null);
  };

  return {
    t,
    draft,
    query,
    previews,
    feedback,
    settings,
    isDirty,
    canSubmit,
    currentSlug,
    feedbackRef,
    isConfirmed,
    feedbackText,
    onSubmit,
    onReload,
    changeDraft,
    setIsConfirmed,
    isChanging: changing.isLoading,
  };
};
