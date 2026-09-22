"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const [briefOpen, setBriefOpen] = useState<boolean>(false);
  const [startOverOpen, setStartOverOpen] = useState<boolean>(false);
  const briefDefaultAppliedRef = useRef<boolean>(false);
  const briefAutoCollapseAppliedRef = useRef<boolean>(false);
  const briefHasUserPreferenceRef = useRef<boolean>(false);

  const confirmStartOver = async () => {
    const succeeded = await chat.startOver();
    if (succeeded) setStartOverOpen(false);
  };

  useEffect(() => {
    const stored = window.sessionStorage.getItem(BRIEF_OPEN_STORAGE_KEY);
    if (stored !== null) {
      setBriefOpen(stored === "true");
      briefDefaultAppliedRef.current = true;
      briefHasUserPreferenceRef.current = true;
      return;
    }
    if (briefDefaultAppliedRef.current || !chat.draft) return;
    briefDefaultAppliedRef.current = true;
    if (chat.draft.completedFieldCount > 0) setBriefOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.draft?.completedFieldCount]);

  useEffect(() => {
    if (briefHasUserPreferenceRef.current) return;
    if (briefAutoCollapseAppliedRef.current) return;
    if (!chat.draft?.isComplete) return;
    briefAutoCollapseAppliedRef.current = true;
    setBriefOpen(false);
  }, [chat.draft?.isComplete]);

  const toggleBrief = () => {
    briefHasUserPreferenceRef.current = true;
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
              aria-label={t(
                briefOpen
                  ? "professionalRoadmapChat.review.collapseBrief"
                  : "professionalRoadmapChat.review.expandBrief",
              )}
              className="mb-2 flex w-full items-center justify-between gap-3 rounded-md border bg-card p-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent/50"
            >
              <span className="flex items-center gap-2">
                {t("professionalRoadmapChat.review.title")}
                <span
                  aria-hidden
                  className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground"
                >
                  {chat.draft?.completedFieldCount}/
                  {chat.draft?.requiredFieldCount}
                </span>
              </span>
              <ChevronDown
                aria-hidden
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                  briefOpen && "rotate-180",
                )}
              />
            </button>

            <div
              id="roadmap-brief-panel"
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-in-out",
                briefOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">{brief}</div>
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
