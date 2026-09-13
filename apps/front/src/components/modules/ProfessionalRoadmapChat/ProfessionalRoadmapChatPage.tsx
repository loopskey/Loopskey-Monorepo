"use client";

import { useEffect, useMemo, useState } from "react";
import { RoadmapChatTranscript } from "./RoadmapChatTranscript";
import { RoadmapReviewSummary } from "./RoadmapReviewSummary";
import { RoadmapChatComposer } from "./RoadmapChatComposer";
import { useRoadmapChat } from "@/hooks/useRoadmapChat";
import { ChevronDown } from "lucide-react";
import { GlassCard } from "@/components/elements/glass-card";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import Link from "next/link";

const ROADMAP_TAB_HREF = "/dashboard/professional?tab=roadmap";
const BRIEF_OPEN_STORAGE_KEY = "roadmapChat.briefOpen";

export const ProfessionalRoadmapChatPage = () => {
  const { t } = useI18n();
  const chat = useRoadmapChat();
  const [briefOpen, setBriefOpen] = useState<boolean>(true);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(BRIEF_OPEN_STORAGE_KEY);
    if (stored !== null) setBriefOpen(stored === "true");
  }, []);

  const toggleBrief = () => {
    setBriefOpen((previous) => {
      const next = !previous;
      window.sessionStorage.setItem(BRIEF_OPEN_STORAGE_KEY, String(next));
      return next;
    });
  };

  const questionKey = useMemo(
    () => `${chat.draft?.currentStep ?? "none"}:${chat.draft?.updatedAt ?? ""}`,
    [chat.draft?.currentStep, chat.draft?.updatedAt],
  );

  if (chat.isDraftError)
    return (
      <GlassCard className="flex flex-col items-start gap-3 p-6">
        <h1 className="text-lg font-medium">
          {t("professionalRoadmapChat.error.loadTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("professionalRoadmapChat.error.loadDescription")}
        </p>
        <Button radius="xl" onClick={() => chat.refetchDraft()}>
          {t("professionalRoadmapChat.error.retry")}
        </Button>
      </GlassCard>
    );

  const brief = chat.draft ? (
    <RoadmapReviewSummary
      draft={chat.draft}
      isPatching={chat.isPatching}
      isGenerating={chat.isGenerating}
      onGenerate={chat.generate}
      onPatch={chat.patch}
    />
  ) : null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium tracking-tight md:text-3xl">
            {t("professionalRoadmapChat.title")}
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t("professionalRoadmapChat.subtitle")}
          </p>
        </div>

        <Button asChild radius="xl" variant="outline">
          <Link href={ROADMAP_TAB_HREF}>
            {t("professionalRoadmapChat.backToRoadmaps")}
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        {brief ? (
          <div className="order-1 lg:order-2 lg:sticky lg:top-6">
            <button
              type="button"
              onClick={toggleBrief}
              aria-expanded={briefOpen}
              aria-controls="roadmap-brief-panel"
              className="mb-2 flex w-full items-center justify-between rounded-md border p-3 text-sm font-medium lg:hidden"
            >
              {t("professionalRoadmapChat.review.title")}
              <ChevronDown
                aria-hidden
                className={cn(
                  "h-4 w-4 transition-transform",
                  briefOpen && "rotate-180",
                )}
              />
            </button>

            <div
              id="roadmap-brief-panel"
              className={cn(!briefOpen && "hidden lg:block")}
            >
              {brief}
            </div>
          </div>
        ) : null}

        <GlassCard className="order-2 flex flex-col gap-4 p-5 lg:order-1">
          <div className="max-h-[55vh] overflow-y-auto pr-1">
            <RoadmapChatTranscript
              onRetry={chat.retry}
              pending={chat.pending}
              messages={chat.messages}
              isSending={chat.isSending}
              isLoading={chat.isLoading}
              retryAfter={chat.retryAfter}
            />
          </div>

          <RoadmapChatComposer
            onSend={chat.send}
            widget={chat.widget}
            canSend={chat.canSend}
            onChange={chat.setInput}
            composer={chat.composer}
            questionKey={questionKey}
            onAnswer={chat.answerWith}
            isSending={chat.isSending}
            retryAfter={chat.retryAfter}
          />
        </GlassCard>
      </div>
    </div>
  );
};
