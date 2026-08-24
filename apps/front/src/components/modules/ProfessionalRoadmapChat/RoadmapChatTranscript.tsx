"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/useI18n";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

import type * as T from "@/types/professional-roadmap-chat.types";

type Props = {
  messages: T.TRoadmapChatMessage[];
  pending: T.TPendingMessage | null;
  isSending: boolean;
  isLoading: boolean;
  retryAfter: number;
  onRetry: () => void;
};

/**
 * A SYSTEM message carries a stable code rather than prose — the server never
 * writes copy the browser would have to trust. `ROADMAP_AI_REFUSED` and
 * `ROADMAP_DRAFT_FIELD_UPDATED:<field>` are the two it sends today.
 */
const systemKey = (content: string) => {
  const [code, field] = content.split(":");
  return { code, field: field ?? null };
};

const SystemMessage = ({ content }: { content: string }) => {
  const { t } = useI18n();
  const { code, field } = systemKey(content);

  const text =
    code === "ROADMAP_DRAFT_FIELD_UPDATED" && field
      ? t("professionalRoadmapChat.system.fieldUpdated").replace(
          "{field}",
          t(`professionalRoadmapChat.field.${field}`),
        )
      : t(`professionalRoadmapChat.system.${code}`);

  return (
    <p className="mx-auto max-w-md text-center text-xs text-muted-foreground">
      {text}
    </p>
  );
};

export const RoadmapChatTranscript = ({
  messages,
  pending,
  isSending,
  isLoading,
  retryAfter,
  onRetry,
}: Props) => {
  const { t } = useI18n();
  const endRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    endRef.current?.scrollIntoView({
      block: "end",
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [messages.length, pending, reducedMotion]);

  if (isLoading)
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <Skeleton className="h-16 w-3/4 rounded-2xl" />
        <Skeleton className="ml-auto h-12 w-1/2 rounded-2xl" />
        <Skeleton className="h-20 w-2/3 rounded-2xl" />
      </div>
    );

  return (
    <div
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-label={t("professionalRoadmapChat.transcriptLabel")}
      className="flex flex-col gap-4"
    >
      {messages.map((message) => {
        if (message.role === "SYSTEM")
          return <SystemMessage key={message.id} content={message.content} />;

        const isProfessional = message.role === "PROFESSIONAL";

        return (
          <div
            key={message.id}
            className={cn(
              "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6",
              !reducedMotion && "motion-safe:animate-in motion-safe:fade-in",
              isProfessional
                ? "ml-auto bg-primary text-primary-foreground"
                : "mr-auto bg-muted text-foreground",
            )}
          >
            {message.content}
          </div>
        );
      })}

      {pending ? (
        <div className="ml-auto flex max-w-[85%] flex-col items-end gap-2">
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm leading-6",
              pending.failed
                ? "bg-primary/60 text-primary-foreground"
                : "bg-primary text-primary-foreground",
            )}
          >
            {pending.content}
          </div>

          {pending.failed ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {retryAfter > 0
                  ? t("professionalRoadmapChat.error.retryIn").replace(
                      "{seconds}",
                      String(retryAfter),
                    )
                  : t("professionalRoadmapChat.error.sendFailed")}
              </span>

              <Button
                size="sm"
                radius="xl"
                variant="glass"
                disabled={retryAfter > 0}
                onClick={onRetry}
              >
                {t("professionalRoadmapChat.error.retry")}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {isSending ? (
        <p
          className="mr-auto text-sm text-muted-foreground"
          aria-label={t("professionalRoadmapChat.thinking")}
        >
          {t("professionalRoadmapChat.thinking")}
        </p>
      ) : null}

      <div ref={endRef} />
    </div>
  );
};
