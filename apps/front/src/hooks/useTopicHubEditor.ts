"use client";

import { useSetTopicHubTranslationPublicationMutation } from "@lib/rtk/endpoints/topic-hub.api";
import { useSetTopicHubIndexExclusionMutation } from "@lib/rtk/endpoints/topic-hub.api";
import { HUB_LIMITS, formOfHub, sameHubForm } from "@/utils/topic-hub";
import { CONTENT_KIND_OF, EMPTY_HUB_FORM } from "@/utils/topic-hub";
import { useSetTopicHubStatusMutation } from "@lib/rtk/endpoints/topic-hub.api";
import { useEffect, useRef, useState } from "react";
import { AppLanguage, TopicHubStatus } from "@/lib/graphql/base";
import { useLazyContentIdentityQuery } from "@lib/rtk/endpoints/content-seo.api";
import { useLazyAdminTopicHubQuery } from "@lib/rtk/endpoints/topic-hub.api";
import { useSaveTopicHubMutation } from "@lib/rtk/endpoints/topic-hub.api";
import { normalizeSlugInput } from "@/utils/content-url";
import { HUB_FEEDBACK_KEY } from "@/utils/topic-hub";
import { errorCodeOf } from "@/utils/content-seo";
import { useI18n } from "@/hooks/useI18n";

import type { AdminTopicHubFieldsFragment } from "@/lib/graphql/operations/topic-hub";
import type { THubForm, THubLocale } from "@/utils/topic-hub";
import type { ContentUrlKind } from "@/lib/graphql/base";

type THubFeedback =
  | {
      kind:
        | "saved"
        | "published"
        | "withdrawn"
        | "frenchPublished"
        | "frenchUnpublished"
        | "indexed"
        | "excluded";
    }
  | { kind: "error"; code: string };

type TUseTopicHubEditorInput = {
  hubId: string | null;
  isOpen: boolean;
  onSaved: (hub: AdminTopicHubFieldsFragment) => void;
};

export const useTopicHubEditor = ({
  hubId,
  isOpen,
  onSaved,
}: TUseTopicHubEditorInput) => {
  const { t } = useI18n();
  const feedbackRef = useRef<HTMLParagraphElement>(null);

  const [loadHub, loaded] = useLazyAdminTopicHubQuery();
  const [saveHub, saving] = useSaveTopicHubMutation();
  const [setStatus, changingStatus] = useSetTopicHubStatusMutation();
  const [setTranslationPublication, publishingTranslation] =
    useSetTopicHubTranslationPublicationMutation();
  const [setExclusion, excluding] = useSetTopicHubIndexExclusionMutation();
  const [lookup, lookingUp] = useLazyContentIdentityQuery();

  const [hub, setHub] = useState<AdminTopicHubFieldsFragment | null>(null);
  const [locale, setLocale] = useState<THubLocale>("EN");
  const [form, setForm] = useState<THubForm>(EMPTY_HUB_FORM);
  const [feedback, setFeedback] = useState<THubFeedback | null>(null);
  const [lookupFailed, setLookupFailed] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFeedback(null);
    setLocale("EN");
    setLookupFailed(false);
    if (!hubId) {
      setHub(null);
      setForm(EMPTY_HUB_FORM);
      return;
    }
    void loadHub(hubId, false).then((result) => {
      if (result.data) setHub(result.data);
    });
  }, [isOpen, hubId, loadHub]);

  useEffect(() => {
    setForm(formOfHub(hub, locale));
  }, [hub, locale]);

  useEffect(() => {
    if (feedback?.kind === "error") feedbackRef.current?.focus();
  }, [feedback]);

  const translation = hub?.translations.find((row) => row.locale === "FR");
  const saved = formOfHub(hub, locale);
  const isDirty = hub
    ? !sameHubForm(form, saved)
    : Boolean(form.title.trim() || form.slug.trim());
  const isBusy =
    saving.isLoading ||
    changingStatus.isLoading ||
    publishingTranslation.isLoading ||
    excluding.isLoading;
  const canSave =
    isDirty &&
    !isBusy &&
    Boolean(form.title.trim()) &&
    Boolean(form.introduction.trim()) &&
    Boolean(form.guidance.trim()) &&
    (hub !== null || Boolean(normalizeSlugInput(form.slug)));

  const feedbackText = feedback
    ? t(
        HUB_FEEDBACK_KEY[
          feedback.kind === "error" ? feedback.code : feedback.kind
        ] ?? "topicHubAdmin.feedback.failed",
      )
    : null;

  const accept = (next: AdminTopicHubFieldsFragment, kind: THubFeedback) => {
    setHub(next);
    setFeedback(kind);
    onSaved(next);
  };

  const fail = (error: unknown) =>
    setFeedback({ kind: "error", code: errorCodeOf(error) });

  const changeField = (
    name: "slug" | "title" | "introduction" | "guidance" | "category",
    value: string,
  ) => {
    setForm((previous) => ({ ...previous, [name]: value }));
    setFeedback(null);
  };

  const changeSection = (
    index: number,
    field: "heading" | "body",
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      sections: previous.sections.map((section, position) =>
        position === index ? { ...section, [field]: value } : section,
      ),
    }));
    setFeedback(null);
  };

  const addSection = () =>
    setForm((previous) =>
      previous.sections.length >= HUB_LIMITS.sectionsMax
        ? previous
        : {
            ...previous,
            sections: [...previous.sections, { heading: "", body: "" }],
          },
    );

  const removeSection = (index: number) =>
    setForm((previous) => ({
      ...previous,
      sections: previous.sections.filter((_, position) => position !== index),
    }));

  const addReference = async (kind: ContentUrlKind, slug: string) => {
    const contentKind = CONTENT_KIND_OF[kind];
    const trimmed = slug.trim();
    if (!contentKind || !trimmed) return false;
    setLookupFailed(false);
    const result = await lookup({ kind: contentKind, slug: trimmed }, false);
    if (!result.data) {
      setLookupFailed(true);
      return false;
    }
    const found = result.data;
    setForm((previous) => {
      const exists = previous.references.some(
        (reference) =>
          reference.kind === kind && reference.contentId === found.id,
      );
      if (exists || previous.references.length >= HUB_LIMITS.referencesMax)
        return previous;
      return {
        ...previous,
        references: [
          ...previous.references,
          {
            kind,
            contentId: found.id,
            slug: found.slug,
            title: found.title,
            isEligible: true,
          },
        ],
      };
    });
    setFeedback(null);
    return true;
  };

  const removeReference = (index: number) =>
    setForm((previous) => ({
      ...previous,
      references: previous.references.filter(
        (_, position) => position !== index,
      ),
    }));

  const moveReference = (index: number, direction: -1 | 1) =>
    setForm((previous) => {
      const target = index + direction;
      if (target < 0 || target >= previous.references.length) return previous;
      const references = [...previous.references];
      [references[index], references[target]] = [
        references[target],
        references[index],
      ];
      return { ...previous, references };
    });

  const onSave = async () => {
    const isFrench = locale === "FR";
    const result = await saveHub({
      hubId: hub?.id,
      slug: hub ? undefined : normalizeSlugInput(form.slug),
      locale: isFrench ? AppLanguage.Fr : AppLanguage.En,
      title: form.title.trim(),
      introduction: form.introduction.trim(),
      guidance: form.guidance.trim(),
      sections: form.sections.map((section) => ({
        heading: section.heading.trim(),
        body: section.body.trim(),
      })),
      ...(isFrench
        ? {}
        : {
            category: form.category || null,
            references: form.references.map((reference) => ({
              kind: reference.kind,
              contentId: reference.contentId,
            })),
          }),
      expectedVersion: isFrench ? translation?.version : hub?.version,
    });
    if ("error" in result) return fail(result.error);
    accept(result.data, { kind: "saved" });
  };

  const onPublish = async (publish: boolean) => {
    if (!hub) return;
    const result = await setStatus({
      hubId: hub.id,
      status: publish ? TopicHubStatus.Published : TopicHubStatus.Withdrawn,
      expectedVersion: hub.version,
    });
    if ("error" in result) return fail(result.error);
    accept(result.data, { kind: publish ? "published" : "withdrawn" });
  };

  const onToggleFrench = async () => {
    if (!hub || !translation) return;
    const publish = !translation.isPublished;
    const result = await setTranslationPublication({
      hubId: hub.id,
      locale: AppLanguage.Fr,
      published: publish,
      expectedVersion: translation.version,
    });
    if ("error" in result) return fail(result.error);
    accept(result.data, {
      kind: publish ? "frenchPublished" : "frenchUnpublished",
    });
  };

  const onToggleIndex = async () => {
    if (!hub) return;
    const excluded = !hub.excludeFromIndex;
    const result = await setExclusion({ hubId: hub.id, excluded });
    if ("error" in result) return fail(result.error);
    setHub({ ...hub, excludeFromIndex: result.data.excludeFromIndex });
    setFeedback({ kind: excluded ? "excluded" : "indexed" });
  };

  const onReload = async () => {
    if (!hub) return;
    setFeedback(null);
    const result = await loadHub(hub.id, false);
    if (result.data) setHub(result.data);
  };

  return {
    t,
    hub,
    form,
    locale,
    isBusy,
    onSave,
    isDirty,
    canSave,
    onReload,
    feedback,
    onPublish,
    setLocale,
    addSection,
    translation,
    changeField,
    feedbackRef,
    lookupFailed,
    addReference,
    feedbackText,
    onToggleIndex,
    removeSection,
    changeSection,
    moveReference,
    onToggleFrench,
    removeReference,
    isSaving: saving.isLoading,
    isLoading: loaded.isFetching,
    lookingUp: lookingUp.isFetching,
  };
};
