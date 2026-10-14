"use client";

import { KeyboardEvent, useEffect, useRef } from "react";
import { TRoadmapChatComposer } from "@/types/professional-roadmap-chat.types";
import { useI18n } from "@/hooks/useI18n";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const INPUT_MAX_HEIGHT_PX = 128;

export const RoadmapChatComposer = ({
  onSend,
  canSend,
  composer,
  onChange,
  isSending,
  retryAfter,
  questionKey,
}: TRoadmapChatComposer) => {
  const { t } = useI18n();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isSending) return;
    inputRef.current?.focus();
  }, [isSending, questionKey]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, INPUT_MAX_HEIGHT_PX)}px`;
    input.style.overflowY =
      input.scrollHeight > INPUT_MAX_HEIGHT_PX ? "auto" : "hidden";
  }, [composer.value]);

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    onSend();
  };

  const disabled = isSending || retryAfter > 0;

  return (
    <div className="space-y-1.5 border-t px-3 pb-3 pt-2.5 sm:px-5 sm:pb-4">
      <div
        className={cn(
          "flex items-end gap-2 rounded-2xl border bg-background py-1.5 pl-4 pr-1.5 transition-shadow",
          "focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15",
          composer.isOverLimit &&
            "border-destructive focus-within:border-destructive",
        )}
      >
        <textarea
          rows={1}
          ref={inputRef}
          disabled={disabled}
          onKeyDown={onKeyDown}
          value={composer.value}
          id="roadmap-chat-composer-input"
          aria-describedby="roadmap-chat-counter"
          onChange={(event) => onChange(event.target.value)}
          aria-label={t("professionalRoadmapChat.composer.label")}
          placeholder={t("professionalRoadmapChat.composer.placeholder")}
          className="min-h-9 flex-1 resize-none overflow-hidden bg-transparent placeholder:truncate py-1.5 text-sm leading-6 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="button"
          onClick={onSend}
          disabled={!canSend}
          aria-label={t("professionalRoadmapChat.composer.send")}
          className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          <ArrowUp aria-hidden className="size-4" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 px-1 text-xs text-muted-foreground">
        <span className="max-sm:hidden">
          {t("professionalRoadmapChat.composer.hint")}
        </span>

        <span
          aria-live="polite"
          id="roadmap-chat-counter"
          className={cn(
            "ml-auto tabular-nums",
            composer.isOverLimit && "text-destructive",
            !composer.showCounter && retryAfter <= 0 && "sr-only",
          )}
        >
          {retryAfter > 0
            ? t("professionalRoadmapChat.error.retryIn", {
                seconds: retryAfter,
              })
            : composer.isOverLimit
              ? t("professionalRoadmapChat.composer.overLimit", {
                  over: Math.abs(composer.remaining),
                })
              : t("professionalRoadmapChat.composer.remaining", {
                  remaining: composer.remaining,
                })}
        </span>
      </div>
    </div>
  );
};
