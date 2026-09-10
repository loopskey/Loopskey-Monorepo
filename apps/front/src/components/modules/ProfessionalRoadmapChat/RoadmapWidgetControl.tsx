"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import type * as T from "@/types/professional-roadmap-chat.types";

export const RoadmapWidgetControl = ({
  widget,
  disabled,
  onAnswer,
}: T.TRoadmapWidgetControl) => {
  const { t } = useI18n();
  const [selected, setSelected] = useState<string[]>([]);
  const [date, setDate] = useState<string>("");

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
          className="w-auto"
          disabled={disabled}
          aria-label={t("professionalRoadmapChat.widget.chooseDate")}
          onChange={(event) => setDate(event.target.value)}
        />
        <Button
          radius="xl"
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
            radius="xl"
            variant="outline"
            key={option.value}
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
            radius="xl"
            variant="outline"
            key={option.value}
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
              radius="xl"
              key={option.value}
              aria-pressed={isSelected}
              onClick={() => toggle(option.value)}
              variant={isSelected ? "default" : "outline"}
              disabled={disabled || (atLimit && !isSelected)}
              className={cn(atLimit && !isSelected && "opacity-50")}
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
          disabled={disabled || selected.length === 0}
          onClick={() => onAnswer(selected.join(", "))}
        >
          {t("professionalRoadmapChat.widget.confirmSelection")}
        </Button>
      </div>
    </div>
  );
};
