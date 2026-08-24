"use client";

import { KeyboardEvent, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/useI18n";

import { RoadmapWidgetControl } from "./RoadmapWidgetControl";

import type * as T from "@/types/professional-roadmap-chat.types";

type Props = {
  widget: T.TRoadmapWidget | null;
  composer: T.TComposerState;
  canSend: boolean;
  isSending: boolean;
  retryAfter: number;
  /** Changes whenever the server asks something new, so focus can follow. */
  questionKey: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onAnswer: (value: string) => void;
};

export const RoadmapChatComposer = ({
  widget,
  composer,
  canSend,
  isSending,
  retryAfter,
  questionKey,
  onChange,
  onSend,
  onAnswer,
}: Props) => {
  const { t } = useI18n();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus follows the conversation: every new question puts the caret back in
  // the composer, so answering three in a row never needs the mouse.
  useEffect(() => {
    if (isSending) return;
    inputRef.current?.focus();
  }, [isSending, questionKey]);

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    onSend();
  };

  const disabled = isSending || retryAfter > 0;

  return (
    <div className="flex flex-col gap-3">
      {/*
        The widget and the free-text input are siblings on purpose. The widget
        is the server's suggestion for the fastest answer, not a restriction —
        a professional may answer any question in their own words, and one
        sentence can satisfy several fields at once.
      */}
      {widget ? (
        <RoadmapWidgetControl
          widget={widget}
          disabled={disabled}
          onAnswer={onAnswer}
        />
      ) : null}

      <div className="flex flex-col gap-2">
        <Textarea
          ref={inputRef}
          rows={3}
          value={composer.value}
          disabled={disabled}
          onKeyDown={onKeyDown}
          aria-label={t("professionalRoadmapChat.composer.label")}
          aria-describedby="roadmap-chat-counter"
          placeholder={t("professionalRoadmapChat.composer.placeholder")}
          onChange={(event) => onChange(event.target.value)}
          className={cn(composer.isOverLimit && "border-destructive")}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            id="roadmap-chat-counter"
            aria-live="polite"
            className={cn(
              "text-xs",
              composer.isOverLimit
                ? "text-destructive"
                : "text-muted-foreground",
              !composer.showCounter && "sr-only",
            )}
          >
            {composer.isOverLimit
              ? t("professionalRoadmapChat.composer.overLimit").replace(
                  "{over}",
                  String(Math.abs(composer.remaining)),
                )
              : t("professionalRoadmapChat.composer.remaining").replace(
                  "{remaining}",
                  String(composer.remaining),
                )}
          </span>

          <div className="flex items-center gap-2">
            {retryAfter > 0 ? (
              <span className="text-xs text-muted-foreground">
                {t("professionalRoadmapChat.error.retryIn").replace(
                  "{seconds}",
                  String(retryAfter),
                )}
              </span>
            ) : null}

            <Button
              radius="xl"
              variant="brand"
              disabled={!canSend}
              onClick={onSend}
            >
              {t("professionalRoadmapChat.composer.send")}
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {t("professionalRoadmapChat.composer.hint")}
        </p>
      </div>
    </div>
  );
};
