"use client";

import { ROADMAP_COACH_QUESTION_CODE } from "@/utils/roadmap-chat.constant";
import { ROADMAP_COACH_INTRO_CODE } from "@/utils/roadmap-chat.constant";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { CheckCircle2, Sparkles } from "lucide-react";
import { RoadmapWidgetControl } from "./RoadmapWidgetControl";
import { useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type * as T from "@/types/professional-roadmap-chat.types";

const BUBBLE_CLASS_NAME = "min-w-0 px-4 py-2.5 text-sm leading-6 break-words";

const systemKey = (content: string) => {
  const [code, field] = content.split(":");
  return { code, field: field ?? null };
};

const SystemMessage = ({ content }: { content: string }) => {
  const { t } = useI18n();
  const { code, field } = systemKey(content);

  const text =
    code === "ROADMAP_DRAFT_FIELD_UPDATED" && field
      ? t("professionalRoadmapChat.system.fieldUpdated", {
          field: t(`professionalRoadmapChat.field.${field}`),
        })
      : t(`professionalRoadmapChat.system.${code}`);

  return (
    <p className="flex w-fit max-w-md items-center gap-1.5 self-center rounded-full border bg-background px-3 py-0.5 text-center text-xs text-muted-foreground">
      <CheckCircle2 aria-hidden className="size-3.5 shrink-0 text-success" />
      {text}
    </p>
  );
};

const CoachAvatar = ({ isHidden = false }: { isHidden?: boolean }) => (
  <span
    aria-hidden
    className={cn(
      "grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground",
      isHidden && "invisible",
    )}
  >
    <Sparkles className="size-4" />
  </span>
);

export const RoadmapChatTranscript = ({
  widget,
  draftId,
  pending,
  onRetry,
  messages,
  onAnswer,
  isSending,
  isLoading,
  retryAfter,
}: T.RoadmapChatTranscriptProps) => {
  const { t } = useI18n();
  const endRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const coachLine = (message: T.TRoadmapChatMessage): string | null => {
    if (message.role !== "ASSISTANT") return null;
    if (message.content === ROADMAP_COACH_INTRO_CODE)
      return t("professionalRoadmapChat.coach.intro");
    if (message.content === ROADMAP_COACH_QUESTION_CODE) {
      const field = message.widget?.field;
      const fieldLine = field
        ? t(`professionalRoadmapChat.coach.question.field.${field}`, {}, "")
        : "";
      return (
        fieldLine ||
        t(`professionalRoadmapChat.coach.question.${message.stepKey}`)
      );
    }
    return null;
  };

  const showWidget =
    Boolean(widget) &&
    !isSending &&
    (!pending || pending.failed) &&
    messages.at(-1)?.role === "ASSISTANT";

  useEffect(() => {
    endRef.current?.scrollIntoView({
      block: "end",
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [messages.length, pending, isSending, reducedMotion]);

  if (isLoading)
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <div className="flex gap-2.5">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="h-16 w-3/5 rounded-xl" />
        </div>
        <Skeleton className="ml-auto h-11 w-2/5 rounded-xl" />
        <div className="flex gap-2.5">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="h-12 w-1/2 rounded-xl" />
        </div>
      </div>
    );

  return (
    <div
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-label={t("professionalRoadmapChat.transcriptLabel")}
      className="flex flex-col gap-3.5"
    >
      {messages.map((message, index) => {
        if (message.role === "SYSTEM")
          return <SystemMessage key={message.id} content={message.content} />;

        const isEntering =
          !reducedMotion && "motion-safe:animate-in motion-safe:fade-in";

        if (message.role === "PROFESSIONAL")
          return (
            <div
              key={message.id}
              className={cn(
                BUBBLE_CLASS_NAME,
                "max-w-[85%] self-end rounded-2xl rounded-tr-sm bg-primary text-primary-foreground",
                isEntering,
              )}
            >
              {message.content}
            </div>
          );

        const followsCoach = messages[index - 1]?.role === "ASSISTANT";

        return (
          <div
            key={message.id}
            className={cn("flex max-w-[85%] items-start gap-2.5", isEntering)}
          >
            <CoachAvatar isHidden={followsCoach} />
            <div
              className={cn(
                BUBBLE_CLASS_NAME,
                "rounded-2xl rounded-tl-sm bg-muted text-foreground",
              )}
            >
              {followsCoach ? null : (
                <span className="block text-[11px] font-semibold tracking-wide text-primary">
                  {t("professionalRoadmapChat.coach.name")}
                </span>
              )}
              {coachLine(message) ?? message.content}
            </div>
          </div>
        );
      })}

      {showWidget && widget ? (
        <div className="sm:pl-[2.625rem]">
          <RoadmapWidgetControl
            widget={widget}
            draftId={draftId}
            onAnswer={onAnswer}
            disabled={retryAfter > 0}
          />
        </div>
      ) : null}

      {pending ? (
        <div className="flex max-w-[85%] flex-col items-end gap-2 self-end">
          <div
            className={cn(
              BUBBLE_CLASS_NAME,
              "rounded-2xl rounded-tr-sm text-primary-foreground",
              pending.failed ? "bg-primary/60" : "bg-primary",
            )}
          >
            {pending.content}
          </div>

          {pending.failed ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span role="alert" className="text-xs text-destructive">
                {retryAfter > 0
                  ? t("professionalRoadmapChat.error.retryIn", {
                      seconds: retryAfter,
                    })
                  : t("professionalRoadmapChat.error.sendFailed")}
              </span>

              <Button
                size="sm"
                radius="full"
                variant="outline"
                onClick={onRetry}
                disabled={retryAfter > 0}
              >
                {t("professionalRoadmapChat.error.retry")}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {isSending ? (
        <div className="flex items-start gap-2.5">
          <CoachAvatar />
          <div
            className={cn(
              BUBBLE_CLASS_NAME,
              "rounded-2xl rounded-tl-sm bg-muted",
            )}
          >
            <span className="sr-only">
              {t("professionalRoadmapChat.thinking")}
            </span>
            <span aria-hidden className="flex gap-1 py-2">
              <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground motion-reduce:animate-none" />
              <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:150ms] motion-reduce:animate-none" />
              <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:300ms] motion-reduce:animate-none" />
            </span>
          </div>
        </div>
      ) : null}

      <div ref={endRef} />
    </div>
  );
};
