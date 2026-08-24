"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/useI18n";

import type * as T from "@/types/professional-roadmap-chat.types";

type Props = {
  widget: T.TRoadmapWidget;
  disabled: boolean;
  onAnswer: (value: string) => void;
};

/**
 * The shortcut the server suggests for the current question. It is never the
 * only way to answer — the composer's free-text input sits beside it, because
 * one sentence may fill several fields at once and the widget only covers one.
 */
export const RoadmapWidgetControl = ({ widget, disabled, onAnswer }: Props) => {
  const { t } = useI18n();
  const [selected, setSelected] = useState<string[]>([]);
  const [date, setDate] = useState<string>("");

  // A new question clears whatever was half-chosen for the previous one.
  useEffect(() => {
    setSelected([]);
    setDate("");
  }, [widget.field, widget.type]);

  const limit = widget.maxSelections ?? widget.options.length;
  const atLimit = selected.length >= limit;

  const toggle = (value: string) => {
    setSelected((current) => {
      if (current.includes(value))
        return current.filter((entry) => entry !== value);
      if (current.length >= limit) return current;
      return [...current, value];
    });
  };

  const selectionLabel = useMemo(
    () =>
      t("professionalRoadmapChat.widget.selectedOfMax")
        .replace("{selected}", String(selected.length))
        .replace("{max}", String(limit)),
    [limit, selected.length, t],
  );

  if (widget.type === "TEXT") return null;

  if (widget.type === "DATE")
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="date"
          value={date}
          disabled={disabled}
          className="w-auto"
          aria-label={t("professionalRoadmapChat.widget.chooseDate")}
          onChange={(event) => setDate(event.target.value)}
        />
        <Button
          radius="xl"
          variant="brand"
          disabled={disabled || !date}
          onClick={() => onAnswer(date)}
        >
          {t("professionalRoadmapChat.widget.useDate")}
        </Button>
      </div>
    );

  if (widget.type === "YES_NO")
    return (
      <div className="flex flex-wrap gap-2">
        {widget.options.map((option) => (
          <Button
            key={option.value}
            radius="xl"
            variant="glass"
            disabled={disabled}
            onClick={() => onAnswer(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    );

  if (widget.type === "SINGLE_SELECT")
    return (
      <div className="flex flex-wrap gap-2" role="group">
        {widget.options.map((option) => (
          <Button
            key={option.value}
            radius="xl"
            variant="glass"
            disabled={disabled}
            onClick={() => onAnswer(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2" role="group">
        {widget.options.map((option) => {
          const isSelected = selected.includes(option.value);

          return (
            <Button
              key={option.value}
              radius="xl"
              variant={isSelected ? "brand" : "glass"}
              aria-pressed={isSelected}
              // Options past the limit stay reachable so a screen reader can
              // still read them; only choosing a new one is refused.
              disabled={disabled || (atLimit && !isSelected)}
              className={cn(atLimit && !isSelected && "opacity-50")}
              onClick={() => toggle(option.value)}
            >
              {option.label}
            </Button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span aria-live="polite" className="text-xs text-muted-foreground">
          {selectionLabel}
        </span>

        <Button
          radius="xl"
          variant="brand"
          disabled={disabled || selected.length === 0}
          onClick={() => onAnswer(selected.join(", "))}
        >
          {t("professionalRoadmapChat.widget.confirmSelection")}
        </Button>
      </div>
    </div>
  );
};
