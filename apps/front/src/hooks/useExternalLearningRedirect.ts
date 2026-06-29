"use client";

import { useTrackExternalLearningClickMutation } from "@/lib/rtk/endpoints/external-learning.api";
import { ExternalLearningProvider } from "@/lib/graphql/generated";
import { TTrackRedirectInput } from "@/types/hooks.types";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

export const useExternalLearningRedirect = () => {
  const { t } = useI18n();
  const [trackClick, state] = useTrackExternalLearningClickMutation();

  const trackAndOpen = async (input: TTrackRedirectInput) => {
    try {
      const activity = await trackClick({
        title: input.title,
        externalUrl: input.externalUrl,
        provider: input.provider ?? ExternalLearningProvider.Other,
        courseId: input.courseId ?? undefined,
        eventId: input.eventId ?? undefined,
      }).unwrap();
      window.open(activity.externalUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.log("TRACK EXTERNAL LEARNING ERROR:", error);
      notify.error(t("authPages.common.genericError"));
    }
  };
  return {
    trackAndOpen,
    isTracking: state.isLoading,
  };
};
