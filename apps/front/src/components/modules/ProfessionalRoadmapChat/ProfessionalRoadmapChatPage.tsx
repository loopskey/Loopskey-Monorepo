"use client";

import { ArrowLeft, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { RoadmapChatTranscript } from "./RoadmapChatTranscript";
import { RoadmapChatComposer } from "./RoadmapChatComposer";
import { RoadmapChatStages } from "./RoadmapChatStages";
import { RoadmapEditBanner } from "./RoadmapEditBanner";
import { RoadmapBriefRing } from "./RoadmapBriefRing";
import { ROADMAP_TAB_HREF } from "@/utils/roadmap-navigation.util";
import { useSearchParams } from "next/navigation";
import { useRoadmapChat } from "@/hooks/useRoadmapChat";
import { ConfirmDialog } from "@/components/elements/confirm-dialog";
import { RoadmapBrief } from "./RoadmapBrief";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import * as Sh from "@/components/ui/sheet";

import Link from "next/link";

const WORKSPACE_CLASS_NAME =
  "flex h-[calc(100dvh-6rem)] min-h-[32rem] flex-col overflow-hidden rounded-xl border bg-card text-left md:h-[calc(100dvh-7rem)]";

const SAVE_STATE_CLASS_NAME = {
  saving: "bg-muted text-muted-foreground",
  saved: "bg-success-soft text-success-soft-foreground",
  error: "bg-destructive/10 text-destructive",
} as const;

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
      <div
        className={cn(WORKSPACE_CLASS_NAME, "items-center justify-center p-6")}
      >
        <div className="max-w-md space-y-3 text-center">
          <h1 className="text-lg font-medium">
            {t("professionalRoadmapChat.error.loadTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("professionalRoadmapChat.error.loadDescription")}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => chat.refetchDraft()}>
              {t("professionalRoadmapChat.error.retry")}
            </Button>
            <Button asChild variant="outline">
              <Link href={ROADMAP_TAB_HREF}>
                {t("professionalRoadmapChat.backToRoadmaps")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );

  const brief = chat.draft ? (
    <RoadmapBrief
      draft={chat.draft}
      onPatch={chat.patch}
      key={chat.resetCount}
      focusStage={focusStage}
      onGenerate={chat.generate}
      isPatching={chat.isPatching}
      isGenerating={chat.isGenerating}
      onPatchCpdSetup={chat.patchCpdSetup}
      isPatchingCpdSetup={chat.isPatchingCpdSetup}
    />
  ) : null;

  return (
    <div className={WORKSPACE_CLASS_NAME}>
      <header className="flex items-center gap-2 border-b px-3 py-2.5 sm:px-5">
        <Button
          asChild
          size="iconSm"
          variant="ghost"
          className="-ml-1 shrink-0 text-muted-foreground"
        >
          <Link
            href={ROADMAP_TAB_HREF}
            aria-label={t("professionalRoadmapChat.backToRoadmaps")}
          >
            <ArrowLeft className="size-4" />
          </Link>
        </Button>

        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">
            {t(
              chat.draft?.replacesRoadmapId
                ? "professionalRoadmapChat.edit.title"
                : "professionalRoadmapChat.title",
            )}
          </h1>

          {saveState ? (
            <span
              aria-live="polite"
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium max-sm:sr-only",
                SAVE_STATE_CLASS_NAME[saveState],
              )}
            >
              {saveState === "saving" ? (
                <Loader2 aria-hidden className="size-3 animate-spin" />
              ) : saveState === "saved" ? (
                <CheckCircle2 aria-hidden className="size-3" />
              ) : null}
              {t(`professionalRoadmapChat.saveState.${saveState}`)}
            </span>
          ) : null}
        </div>

        {chat.draft && brief ? (
          <Sh.Sheet open={briefSheetOpen} onOpenChange={setBriefSheetOpen}>
            <Sh.SheetTrigger asChild>
              <Button
                size="sm"
                radius="full"
                variant="outline"
                className="shrink-0 gap-1.5 pl-1.5 lg:hidden"
              >
                <RoadmapBriefRing
                  className="size-6"
                  completed={chat.draft.completedFieldCount}
                  required={chat.draft.requiredFieldCount}
                />
                {t("professionalRoadmapChat.briefButtonMobile", {
                  completed: chat.draft.completedFieldCount,
                  required: chat.draft.requiredFieldCount,
                })}
              </Button>
            </Sh.SheetTrigger>

            <Sh.SheetContent
              side="bottom"
              className="h-[85dvh] gap-0 overflow-hidden rounded-t-2xl p-0"
            >
              <Sh.SheetHeader className="sr-only">
                <Sh.SheetTitle>
                  {t("professionalRoadmapChat.review.title")}
                </Sh.SheetTitle>
                <Sh.SheetDescription>
                  {t("professionalRoadmapChat.review.description")}
                </Sh.SheetDescription>
              </Sh.SheetHeader>

              {brief}
            </Sh.SheetContent>
          </Sh.Sheet>
        ) : null}

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
              <Button
                size="sm"
                variant="ghost"
                className="shrink-0 text-muted-foreground"
              >
                <RotateCcw className="size-4" />
                <span className="max-sm:sr-only">
                  {t("professionalRoadmapChat.startOver")}
                </span>
              </Button>
            }
          />
        ) : null}
      </header>

      {chat.draft?.replacesRoadmapId ? (
        <RoadmapEditBanner
          onDiscard={chat.discardEdit}
          isDiscarding={chat.isDiscarding}
          title={chat.draft.replacesRoadmapTitle}
        />
      ) : null}

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section
          aria-label={t("professionalRoadmapChat.transcriptLabel")}
          className="flex min-h-0 min-w-0 flex-col"
        >
          {chat.draft ? <RoadmapChatStages draft={chat.draft} /> : null}

          <div className="relative min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            <RoadmapChatTranscript
              widget={chat.widget}
              onRetry={chat.retry}
              pending={chat.pending}
              messages={chat.messages}
              isSending={chat.isSending}
              isLoading={chat.isLoading}
              retryAfter={chat.retryAfter}
              onAnswer={chat.answerWidget}
              draftId={chat.draft?.id ?? ""}
            />
          </div>

          <RoadmapChatComposer
            onSend={chat.send}
            canSend={chat.canSend}
            onChange={chat.setInput}
            composer={chat.composer}
            questionKey={questionKey}
            retryAfter={chat.retryAfter}
            isSending={chat.isSending || chat.isPatching}
          />
        </section>

        {brief ? (
          <aside
            aria-label={t("professionalRoadmapChat.review.title")}
            className="hidden min-h-0 border-l lg:flex"
          >
            {brief}
          </aside>
        ) : null}
      </div>
    </div>
  );
};
