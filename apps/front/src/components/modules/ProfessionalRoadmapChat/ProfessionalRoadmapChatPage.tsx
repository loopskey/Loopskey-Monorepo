"use client";

import { useMemo, useState } from "react";
import { RoadmapPreferencesWizard } from "./RoadmapPreferencesWizard";
import { RotateCcw } from "lucide-react";
import { RoadmapChatTranscript } from "./RoadmapChatTranscript";
import { RoadmapReviewSummary } from "./RoadmapReviewSummary";
import { RoadmapChatComposer } from "./RoadmapChatComposer";
import { RoadmapDraftStep } from "@/lib/graphql/base";
import { useRoadmapChat } from "@/hooks/useRoadmapChat";
import { ConfirmDialog } from "@/components/elements/confirm-dialog";
import { GlassCard } from "@/components/elements/glass-card";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";

import Link from "next/link";

const ROADMAP_TAB_HREF = "/dashboard/professional?tab=roadmap";

export const ProfessionalRoadmapChatPage = () => {
  const { t } = useI18n();
  const chat = useRoadmapChat();
  const [startOverOpen, setStartOverOpen] = useState<boolean>(false);

  const confirmStartOver = async () => {
    const succeeded = await chat.startOver();
    if (succeeded) setStartOverOpen(false);
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

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        {brief ? (
          <div className="order-1 lg:order-2 lg:sticky lg:top-6">{brief}</div>
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
            onAnswer={chat.answerWidget}
            isSending={chat.isSending || chat.isPatching}
            retryAfter={chat.retryAfter}
            preferencesControl={
              chat.draft?.currentStep === RoadmapDraftStep.Preferences ? (
                <RoadmapPreferencesWizard
                  draft={chat.draft}
                  onPatch={chat.patch}
                  isPatching={chat.isPatching}
                />
              ) : undefined
            }
          />
        </GlassCard>
      </div>
    </div>
  );
};
