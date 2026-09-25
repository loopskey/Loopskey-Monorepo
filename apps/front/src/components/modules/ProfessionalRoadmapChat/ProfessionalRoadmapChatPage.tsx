"use client";

import { useMemo, useRef, useState } from "react";
import { RoadmapChatTranscript } from "./RoadmapChatTranscript";
import { RoadmapReviewSummary } from "./RoadmapReviewSummary";
import { RoadmapChatComposer } from "./RoadmapChatComposer";
import { useSearchParams } from "next/navigation";
import { useRoadmapChat } from "@/hooks/useRoadmapChat";
import { ConfirmDialog } from "@/components/elements/confirm-dialog";
import { GlassCard } from "@/components/elements/glass-card";
import { RotateCcw } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";

import * as Sh from "@/components/ui/sheet";

import Link from "next/link";

const ROADMAP_TAB_HREF = "/dashboard/professional?tab=roadmap";

export const ProfessionalRoadmapChatPage = () => {
  const { t } = useI18n();
  const chat = useRoadmapChat();
  const searchParams = useSearchParams();
  const [startOverOpen, setStartOverOpen] = useState<boolean>(false);
  const [briefSheetOpen, setBriefSheetOpen] = useState<boolean>(false);

  const focusStage =
    searchParams.get("focus") === "preferences"
      ? ("preferences" as const)
      : undefined;

  const resetSucceededRef = useRef(false);

  const confirmStartOver = async () => {
    const succeeded = await chat.startOver();
    if (!succeeded) return;
    resetSucceededRef.current = true;
    setStartOverOpen(false);
  };

  const onStartOverDialogClose = (event: Event) => {
    if (!resetSucceededRef.current) return;
    resetSucceededRef.current = false;
    event.preventDefault();
    requestAnimationFrame(() => {
      document.getElementById("roadmap-chat-composer-input")?.focus();
    });
  };

  const questionKey = useMemo(
    () => `${chat.draft?.currentStep ?? "none"}:${chat.draft?.updatedAt ?? ""}`,
    [chat.draft?.currentStep, chat.draft?.updatedAt],
  );

  const saveState: "saving" | "error" | "saved" | null =
    chat.isSending || chat.isPatching || chat.isPatchingCpdSetup
      ? "saving"
      : chat.turnError
        ? "error"
        : chat.draft
          ? "saved"
          : null;

  if (chat.isDraftError)
    return (
      <GlassCard className="flex flex-col items-start gap-3 p-6">
        <h1 className="text-lg font-medium">
          {t("professionalRoadmapChat.error.loadTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("professionalRoadmapChat.error.loadDescription")}
        </p>
        <div className="flex gap-3">
          <Button radius="xl" onClick={() => chat.refetchDraft()}>
            {t("professionalRoadmapChat.error.retry")}
          </Button>
          <Button asChild radius="xl" variant="outline">
            <Link href={ROADMAP_TAB_HREF}>
              {t("professionalRoadmapChat.backToRoadmaps")}
            </Link>
          </Button>
        </div>
      </GlassCard>
    );

  const briefContent = chat.draft ? (
    <RoadmapReviewSummary
      key={chat.resetCount}
      draft={chat.draft}
      onPatch={chat.patch}
      onGenerate={chat.generate}
      isPatching={chat.isPatching}
      isGenerating={chat.isGenerating}
      focusStage={focusStage}
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
          {saveState ? (
            <p
              aria-live="polite"
              className="mt-1 text-xs text-muted-foreground"
            >
              {t(`professionalRoadmapChat.saveState.${saveState}`)}
            </p>
          ) : null}
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
              onCloseAutoFocus={onStartOverDialogClose}
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

      {chat.draft && briefContent ? (
        <div className="lg:hidden">
          <Sh.Sheet open={briefSheetOpen} onOpenChange={setBriefSheetOpen}>
            <Sh.SheetTrigger asChild>
              <Button radius="xl" variant="outline" className="w-full">
                {t("professionalRoadmapChat.briefButtonMobile", {
                  completed: chat.draft.completedFieldCount,
                  required: chat.draft.requiredFieldCount,
                })}
              </Button>
            </Sh.SheetTrigger>

            <Sh.SheetContent
              side="bottom"
              className="max-h-[85vh] overflow-y-auto rounded-t-2xl"
            >
              <Sh.SheetHeader>
                <Sh.SheetTitle>
                  {t("professionalRoadmapChat.review.title")}
                </Sh.SheetTitle>
                <Sh.SheetDescription className="sr-only">
                  {t("professionalRoadmapChat.review.description")}
                </Sh.SheetDescription>
              </Sh.SheetHeader>

              <div className="px-4 pb-6">{briefContent}</div>
            </Sh.SheetContent>
          </Sh.Sheet>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <GlassCard className="flex flex-col gap-4 p-5">
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
            draftId={chat.draft?.id ?? ""}
            onChange={chat.setInput}
            composer={chat.composer}
            questionKey={questionKey}
            onAnswer={chat.answerWidget}
            isSending={chat.isSending || chat.isPatching}
            retryAfter={chat.retryAfter}
          />
        </GlassCard>

        {briefContent ? (
          <div className="hidden lg:sticky lg:top-6 lg:block">
            {briefContent}
          </div>
        ) : null}
      </div>
    </div>
  );
};
