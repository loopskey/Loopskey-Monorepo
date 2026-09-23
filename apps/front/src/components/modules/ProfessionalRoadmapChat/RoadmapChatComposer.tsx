"use client";

import { KeyboardEvent, useEffect, useRef } from "react";
import { RoadmapWidgetControl } from "./RoadmapWidgetControl";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { ReactNode } from "react";
import type * as T from "@/types/professional-roadmap-chat.types";

type Props = {
  canSend: boolean;
  isSending: boolean;
  retryAfter: number;
  onSend: () => void;
  questionKey: string;
  composer: T.TComposerState;
  preferencesControl?: ReactNode;
  widget: T.TRoadmapWidget | null;
  onChange: (value: string) => void;
  onAnswer: (value: string) => void;
};

export const RoadmapChatComposer = ({
  widget,
  onSend,
  canSend,
  composer,
  onChange,
  onAnswer,
  isSending,
  retryAfter,
  questionKey,
  preferencesControl,
}: Props) => {
  const { t } = useI18n();
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
  const hasQuickAnswers = Boolean(preferencesControl) || Boolean(widget);

  return (
    <div className="flex flex-col gap-3">
      {preferencesControl ?? null}
      {!preferencesControl && widget ? (
        <RoadmapWidgetControl
          widget={widget}
          disabled={disabled}
          onAnswer={onAnswer}
        />
      ) : null}

      {hasQuickAnswers ? (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
          {t("professionalRoadmapChat.composer.orOwnWords")}
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Textarea
          rows={3}
          ref={inputRef}
          disabled={disabled}
          onKeyDown={onKeyDown}
          value={composer.value}
          id="roadmap-chat-composer-input"
          aria-describedby="roadmap-chat-counter"
          onChange={(event) => onChange(event.target.value)}
          aria-label={t("professionalRoadmapChat.composer.label")}
          className={cn(composer.isOverLimit && "border-destructive")}
          placeholder={t("professionalRoadmapChat.composer.placeholder")}
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

            <Button radius="xl" disabled={!canSend} onClick={onSend}>
              {t("professionalRoadmapChat.composer.send")}
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {t("professionalRoadmapChat.composer.correctionHint")}
        </p>

        <p className="text-xs text-muted-foreground">
          {t("professionalRoadmapChat.composer.hint")}
        </p>
      </div>
    </div>
  );
};
