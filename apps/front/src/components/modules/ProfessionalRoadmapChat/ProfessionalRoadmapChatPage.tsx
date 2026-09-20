"use client";

import { useEffect, useMemo, useState } from "react";
import { RoadmapPreferencesWizard } from "./RoadmapPreferencesWizard";
import { ChevronDown, RotateCcw } from "lucide-react";
import { RoadmapChatTranscript } from "./RoadmapChatTranscript";
import { RoadmapReviewSummary } from "./RoadmapReviewSummary";
import { RoadmapChatComposer } from "./RoadmapChatComposer";
import { RoadmapChatStepper } from "./RoadmapChatStepper";
import { RoadmapDraftStep } from "@/lib/graphql/base";
import { useRoadmapChat } from "@/hooks/useRoadmapChat";
import { ConfirmDialog } from "@/components/elements/confirm-dialog";
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
  const [startOverOpen, setStartOverOpen] = useState<boolean>(false);

  const confirmStartOver = async () => {
    const succeeded = await chat.startOver();
    if (succeeded) setStartOverOpen(false);
  };

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
      onPatch={chat.patch}
      onGenerate={chat.generate}
      isPatching={chat.isPatching}
      isGenerating={chat.isGenerating}
      onPatchCpdSetup={chat.patchCpdSetup}
      isPatchingCpdSetup={chat.isPatchingCpdSetup}
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

        <div className="flex flex-wrap gap-3">
          {chat.draft ? (
            <ConfirmDialog
              open={startOverOpen}
              confirmVariant="destructive"
              isLoading={chat.isResetting}
              onConfirm={confirmStartOver}
              cancelText={t("common.cancel")}
              onOpenChange={setStartOverOpen}
              confirmText={t("professionalRoadmapChat.startOver")}
              title={t("professionalRoadmapChat.startOverConfirmTitle")}
              description={t(
                "professionalRoadmapChat.startOverConfirmDescription",
              )}
              trigger={
                <Button radius="xl" variant="outline">
                  <RotateCcw className="h-4 w-4" />
                  {t("professionalRoadmapChat.startOver")}
                </Button>
              }
            />
          ) : null}

          <Button asChild radius="xl" variant="outline">
            <Link href={ROADMAP_TAB_HREF}>
              {t("professionalRoadmapChat.backToRoadmaps")}
            </Link>
          </Button>
        </div>
      </div>

      {chat.draft ? (
        <RoadmapChatStepper t={t} currentStep={chat.draft.currentStep} />
      ) : null}

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

        {chat.draft?.currentStep === RoadmapDraftStep.Preferences ? (
          <div className="order-2 lg:order-1">
            <RoadmapPreferencesWizard
              draft={chat.draft}
              onPatch={chat.patch}
              isPatching={chat.isPatching}
            />
          </div>
        ) : (
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
              onAnswer={chat.answerWidget}
              isSending={chat.isSending || chat.isPatching}
              retryAfter={chat.retryAfter}
            />
          </GlassCard>
        )}
      </div>
    </div>
  );
};
