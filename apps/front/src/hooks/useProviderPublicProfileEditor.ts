"use client";

import { useWithdrawProviderPublicProfileMutation } from "@lib/rtk/endpoints/provider-public-profile.api";
import { useSubmitProviderPublicProfileMutation } from "@lib/rtk/endpoints/provider-public-profile.api";
import { useSaveProviderPublicProfileMutation } from "@lib/rtk/endpoints/provider-public-profile.api";
import { useMyProviderPublicProfileQuery } from "@lib/rtk/endpoints/provider-public-profile.api";
import { PROFILE_LIMITS, formOfProfile } from "@/utils/provider-public-profile";
import { useEffect, useRef, useState } from "react";
import { ContentSeoUploadError } from "@/utils/content-seo";
import { PROFILE_FEEDBACK_KEY } from "@/utils/provider-public-profile";
import { socialImageRejection } from "@/utils/content-seo";
import { EMPTY_PROFILE_FORM } from "@/utils/provider-public-profile";
import { uploadSocialImage } from "@/utils/content-seo";
import { profileStatusKey } from "@/utils/provider-public-profile";
import { sameProfileForm } from "@/utils/provider-public-profile";
import { errorCodeOf } from "@/utils/content-seo";
import { useI18n } from "@/hooks/useI18n";

import type { TProviderProfileForm } from "@/utils/provider-public-profile";
import type { ChangeEvent } from "react";

type TProfileFeedback =
  | { kind: "saved" | "submitted" | "withdrawn" | "logoUploaded" }
  | { kind: "error"; code: string };

export const useProviderPublicProfileEditor = () => {
  const { t } = useI18n();
  const feedbackRef = useRef<HTMLParagraphElement>(null);

  const query = useMyProviderPublicProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [saveProfile, saving] = useSaveProviderPublicProfileMutation();
  const [submitProfile, submitting] = useSubmitProviderPublicProfileMutation();
  const [withdrawProfile, withdrawing] =
    useWithdrawProviderPublicProfileMutation();

  const profile = query.data ?? null;
  const saved = formOfProfile(profile);

  const [form, setForm] = useState<TProviderProfileForm>(EMPTY_PROFILE_FORM);
  const [feedback, setFeedback] = useState<TProfileFeedback | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setForm(formOfProfile(query.data ?? null));
  }, [query.data]);

  useEffect(() => {
    if (feedback?.kind === "error") feedbackRef.current?.focus();
  }, [feedback]);

  const isDirty = !sameProfileForm(form, saved);
  const isBusy =
    saving.isLoading || submitting.isLoading || withdrawing.isLoading;
  const canSubmit =
    Boolean(profile) &&
    !isDirty &&
    !isBusy &&
    (profile?.reviewState === "DRAFT" || profile?.reviewState === "REJECTED");
  const canWithdraw = Boolean(profile?.isLive) && !isBusy;

  const feedbackText = feedback
    ? t(
        PROFILE_FEEDBACK_KEY[
          feedback.kind === "error" ? feedback.code : feedback.kind
        ] ?? "providerPublicProfile.feedback.failed",
      )
    : null;

  const fail = (error: unknown) =>
    setFeedback({ kind: "error", code: errorCodeOf(error) });

  const changeField = (
    name: "displayName" | "biography" | "websiteUrl",
    value: string,
  ) => {
    setForm((previous) => ({ ...previous, [name]: value }));
    setFeedback(null);
  };

  const changeLink = (index: number, field: "label" | "url", value: string) => {
    setForm((previous) => ({
      ...previous,
      links: previous.links.map((link, position) =>
        position === index ? { ...link, [field]: value } : link,
      ),
    }));
    setFeedback(null);
  };

  const addLink = () =>
    setForm((previous) =>
      previous.links.length >= PROFILE_LIMITS.linksMax
        ? previous
        : { ...previous, links: [...previous.links, { label: "", url: "" }] },
    );

  const removeLink = (index: number) =>
    setForm((previous) => ({
      ...previous,
      links: previous.links.filter((_, position) => position !== index),
    }));

  const onSave = async () => {
    const result = await saveProfile({
      displayName: form.displayName.trim(),
      biography: form.biography.trim() || null,
      websiteUrl: form.websiteUrl.trim() || null,
      links: form.links.map((link) => ({
        label: link.label.trim(),
        url: link.url.trim(),
      })),
      logoImageId: form.logoImageId,
      expectedVersion: profile?.draftVersion,
    });
    if ("error" in result) return fail(result.error);
    setFeedback({ kind: "saved" });
  };

  const onSubmit = async () => {
    if (!profile) return;
    const result = await submitProfile({
      expectedVersion: profile.draftVersion,
    });
    if ("error" in result) return fail(result.error);
    setFeedback({ kind: "submitted" });
  };

  const onWithdraw = async () => {
    const result = await withdrawProfile();
    if ("error" in result) return fail(result.error);
    setFeedback({ kind: "withdrawn" });
  };

  const onReload = async () => {
    setFeedback(null);
    await query.refetch();
  };

  const onChooseLogo = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const rejection = socialImageRejection(file);
    if (rejection) {
      setFeedback({ kind: "error", code: "BAD_USER_INPUT" });
      return;
    }
    setIsUploading(true);
    try {
      const image = await uploadSocialImage(file);
      setForm((previous) => ({
        ...previous,
        logoImageId: image.id,
        logoPath: image.path,
      }));
      setFeedback({ kind: "logoUploaded" });
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

  const onRemoveLogo = () => {
    setForm((previous) => ({ ...previous, logoImageId: null, logoPath: null }));
    setFeedback(null);
  };

  return {
    t,
    form,
    query,
    isBusy,
    onSave,
    profile,
    isDirty,
    addLink,
    feedback,
    onSubmit,
    onReload,
    canSubmit,
    removeLink,
    onWithdraw,
    changeLink,
    changeField,
    canWithdraw,
    feedbackRef,
    isUploading,
    onChooseLogo,
    onRemoveLogo,
    feedbackText,
    isSaving: saving.isLoading,
    isSubmitting: submitting.isLoading,
    statusKey: profileStatusKey(profile),
    isWithdrawing: withdrawing.isLoading,
  };
};
