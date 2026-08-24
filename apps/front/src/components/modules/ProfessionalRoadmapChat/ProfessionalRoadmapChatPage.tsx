"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/elements/glass-card";
import { useI18n } from "@/hooks/useI18n";
import { useRoadmapChat } from "@/hooks/useRoadmapChat";

import { RoadmapChatComposer } from "./RoadmapChatComposer";
import { RoadmapChatTranscript } from "./RoadmapChatTranscript";
import { RoadmapReviewSummary } from "./RoadmapReviewSummary";

const ROADMAP_TAB_HREF = "/dashboard/professional?tab=roadmap";

export const ProfessionalRoadmapChatPage = () => {
  const { t } = useI18n();
  const chat = useRoadmapChat();
  const [keepEditing, setKeepEditing] = useState<boolean>(false);

  /**
   * Focus follows the question, not the message count — a turn that only
   * corrected a field leaves the step where it was, and moving focus then
   * would be noise.
   */
  const questionKey = useMemo(
    () => `${chat.draft?.currentStep ?? "none"}:${chat.draft?.updatedAt ?? ""}`,
    [chat.draft?.currentStep, chat.draft?.updatedAt],
  );

  const showSummary = Boolean(chat.draft?.isComplete) && !keepEditing;

  if (chat.isDraftError)
    return (
      <GlassCard className="flex flex-col items-start gap-3 p-6">
        <h1 className="text-lg font-medium">
          {t("professionalRoadmapChat.error.loadTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("professionalRoadmapChat.error.loadDescription")}
        </p>
        <Button radius="xl" variant="brand" onClick={() => chat.refetchDraft()}>
          {t("professionalRoadmapChat.error.retry")}
        </Button>
      </GlassCard>
    );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium tracking-tight md:text-3xl">
            {t("professionalRoadmapChat.title")}
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t("professionalRoadmapChat.subtitle")}
          </p>
        </div>

        <Button asChild radius="xl" variant="glass">
          <Link href={ROADMAP_TAB_HREF}>
            {t("professionalRoadmapChat.backToRoadmaps")}
          </Link>
        </Button>
      </div>

      <GlassCard className="flex flex-col gap-4 p-5">
        {/*
          The transcript scrolls on its own so the composer stays reachable on
          a short screen.
        */}
        <div className="max-h-[55vh] overflow-y-auto pr-1">
          <RoadmapChatTranscript
            messages={chat.messages}
            pending={chat.pending}
            isSending={chat.isSending}
            isLoading={chat.isLoading}
            retryAfter={chat.retryAfter}
            onRetry={chat.retry}
          />
        </div>

        <RoadmapChatComposer
          widget={chat.widget}
          composer={chat.composer}
          canSend={chat.canSend}
          isSending={chat.isSending}
          retryAfter={chat.retryAfter}
          questionKey={questionKey}
          onChange={chat.setInput}
          onSend={chat.send}
          onAnswer={chat.answerWith}
        />
      </GlassCard>

      {chat.draft && showSummary ? (
        <RoadmapReviewSummary
          draft={chat.draft}
          isPatching={chat.isPatching}
          onPatch={chat.patch}
          onKeepEditing={() => setKeepEditing(true)}
        />
      ) : null}
    </div>
  );
};
