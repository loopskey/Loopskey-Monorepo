"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSetContentIndexExclusionMutation } from "@lib/rtk/endpoints/content-seo.api";
import { useSaveContentSeoMutation } from "@lib/rtk/endpoints/content-seo.api";
import { normalizeDescription } from "@/lib/content-catalog/snippet";
import { useContentSeoQuery } from "@lib/rtk/endpoints/content-seo.api";
import { AppLanguage } from "@/lib/graphql/base";
import { useI18n } from "@/hooks/useI18n";
import {
  ContentSeoUploadError,
  SEO_FEEDBACK_KEY,
  errorCodeOf,
  previewCanonicalUrl,
  resolveSocialImageUrl,
  socialImageRejection,
  uploadSocialImage,
} from "@/utils/content-seo";

import type { TContentSeoFeedback } from "@/types/content-seo.types";
import type { TContentSeoSettings } from "@/types/content-seo.types";
import type { TContentSeoFields } from "@/types/content-seo.types";
import type { TContentSeoKind } from "@/types/content-seo.types";
import type { ChangeEvent } from "react";

const EMPTY_FIELDS: TContentSeoFields = {
  seoTitle: "",
  seoDescription: "",
  socialImageId: null,
  socialImageAlt: "",
};

type TUseContentSeoEditorInput = {
  kind: TContentSeoKind;
  contentId: string;
  slug?: string;
  isEnabled: boolean;
};

export const useContentSeoEditor = ({
  kind,
  contentId,
  slug,
  isEnabled,
}: TUseContentSeoEditorInput) => {
  const { t } = useI18n();
  const feedbackRef = useRef<HTMLParagraphElement>(null);

  const [locale, setLocale] = useState<AppLanguage>(AppLanguage.En);
  const [fields, setFields] = useState<TContentSeoFields>(EMPTY_FIELDS);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [saved, setSaved] = useState<TContentSeoSettings | null>(null);
  const [feedback, setFeedback] = useState<TContentSeoFeedback | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const query = useContentSeoQuery(
    { kind, id: contentId },
    { skip: !isEnabled, refetchOnMountOrArgChange: true },
  );
  const [saveSeo, saving] = useSaveContentSeoMutation();
  const [setExclusion, moderating] = useSetContentIndexExclusionMutation();

  const settings = saved ?? query.data ?? null;
  const current = settings?.locales.find((row) => row.locale === locale);

  useEffect(() => {
    if (query.data) setSaved(null);
  }, [query.data]);

  useEffect(() => {
    setFields({
      seoTitle: current?.seoTitle ?? "",
      seoDescription: current?.seoDescription ?? "",
      socialImageId: current?.socialImageId ?? null,
      socialImageAlt: current?.socialImageAlt ?? "",
    });
    setImagePath(current?.socialImagePath ?? null);
  }, [
    locale,
    current?.version,
    current?.seoTitle,
    current?.seoDescription,
    current?.socialImageId,
    current?.socialImageAlt,
    current?.socialImagePath,
  ]);

  useEffect(() => {
    if (feedback?.kind === "error") feedbackRef.current?.focus();
  }, [feedback]);

  const isDirty =
    fields.seoTitle.trim() !== (current?.seoTitle ?? "") ||
    fields.seoDescription.trim() !== (current?.seoDescription ?? "") ||
    fields.socialImageId !== (current?.socialImageId ?? null) ||
    fields.socialImageAlt.trim() !== (current?.socialImageAlt ?? "");

  const isBusy = saving.isLoading || moderating.isLoading || isUploading;

  const preview = useMemo(() => {
    const title = fields.seoTitle.trim() || current?.defaultTitle || "";
    const description =
      fields.seoDescription.trim() ||
      normalizeDescription(current?.defaultDescription, "");
    return {
      locale,
      title,
      description,
      canonicalUrl: previewCanonicalUrl(kind, slug, locale),
      imageUrl: resolveSocialImageUrl(imagePath),
      imageAlt: fields.socialImageAlt.trim(),
    };
  }, [
    current?.defaultDescription,
    current?.defaultTitle,
    fields.seoDescription,
    fields.seoTitle,
    fields.socialImageAlt,
    imagePath,
    kind,
    locale,
    slug,
  ]);

  const feedbackText = feedback
    ? t(
        SEO_FEEDBACK_KEY[
          feedback.kind === "error" ? feedback.code : feedback.kind
        ] ?? "contentSeo.feedback.failed",
      )
    : null;

  const changeLocale = (next: AppLanguage) => {
    setLocale(next);
    setFeedback(null);
  };

  const changeField = (name: keyof TContentSeoFields, value: string) => {
    setFields((previous) => ({ ...previous, [name]: value }));
    setFeedback(null);
  };

  const onSave = async () => {
    const result = await saveSeo({
      kind,
      input: {
        contentId,
        locale,
        seoTitle: fields.seoTitle.trim() || null,
        seoDescription: fields.seoDescription.trim() || null,
        socialImageId: fields.socialImageId,
        socialImageAlt: fields.socialImageAlt.trim() || null,
        expectedVersion: current?.version || undefined,
      },
    });
    if ("error" in result) {
      setFeedback({ kind: "error", code: errorCodeOf(result.error) });
      return;
    }
    setSaved(result.data);
    setFeedback({ kind: "saved" });
  };

  const onReset = () => {
    setFields(EMPTY_FIELDS);
    setImagePath(null);
    setFeedback(null);
  };

  const onReload = async () => {
    setSaved(null);
    await query.refetch();
    setFeedback(null);
  };

  const onChooseImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const rejection = socialImageRejection(file);
    if (rejection) {
      setFeedback({
        kind: "error",
        code:
          rejection === "type"
            ? "CONTENT_SEO_IMAGE_INVALID_TYPE"
            : "CONTENT_SEO_IMAGE_TOO_LARGE",
      });
      return;
    }

    setIsUploading(true);
    try {
      const image = await uploadSocialImage(file);
      setFields((previous) => ({ ...previous, socialImageId: image.id }));
      setImagePath(image.path);
      setFeedback({ kind: "uploaded" });
    } catch (error) {
      setFeedback({
        kind: "error",
        code:
          error instanceof ContentSeoUploadError && error.code
            ? error.code
            : "UNKNOWN",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onRemoveImage = () => {
    setFields((previous) => ({
      ...previous,
      socialImageId: null,
      socialImageAlt: "",
    }));
    setImagePath(null);
    setFeedback(null);
  };

  const onToggleIndexExclusion = async () => {
    if (!settings) return;
    const excluded = !settings.excludeFromIndex;
    const result = await setExclusion({
      kind,
      input: { contentId, excluded },
    });
    if ("error" in result) {
      setFeedback({ kind: "error", code: errorCodeOf(result.error) });
      return;
    }
    setSaved(result.data);
    setFeedback({ kind: excluded ? "excluded" : "indexed" });
  };

  return {
    t,
    locale,
    fields,
    query,
    current,
    preview,
    isBusy,
    isDirty,
    settings,
    feedback,
    imagePath,
    isUploading,
    feedbackRef,
    feedbackText,
    onSave,
    onReset,
    onReload,
    changeField,
    changeLocale,
    onChooseImage,
    onRemoveImage,
    onToggleIndexExclusion,
    isSaving: saving.isLoading,
    isModerating: moderating.isLoading,
  };
};
