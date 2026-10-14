"use client";

import { useEffect, useMemo, useState } from "react";
import { RoadmapSuggestionExpansion } from "./RoadmapSuggestionExpansion";
import { RoadmapDraftFieldKey } from "@/lib/graphql/base";
import { resolveWidgetOptions } from "@/utils/roadmap-widget-options.util";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import type * as T from "@/types/professional-roadmap-chat.types";

const SUGGESTABLE_FIELDS: ReadonlySet<RoadmapDraftFieldKey> = new Set([
  RoadmapDraftFieldKey.Subjects,
  RoadmapDraftFieldKey.TargetRole,
]);

const CHIP_CLASS_NAME =
  "h-auto min-h-9 rounded-full border-border bg-background px-4 py-1.5 font-semibold text-foreground shadow-none hover:border-primary hover:bg-background hover:text-primary";

const SELECTED_CHIP_CLASS_NAME =
  "border-primary bg-accent text-primary hover:bg-accent";

export const RoadmapWidgetControl = ({
  widget,
  draftId,
  disabled,
  onAnswer,
}: T.TRoadmapWidgetControl) => {
  const { t } = useI18n();
  const [selected, setSelected] = useState<string[]>([]);
  const [date, setDate] = useState<string>("");
  const [extraOptions, setExtraOptions] = useState<T.TRoadmapWidgetOption[]>(
    [],
  );

  useEffect(() => {
    setSelected([]);
    setDate("");
    setExtraOptions([]);
  }, [widget.field, widget.type]);

  const options: T.TRoadmapWidgetOption[] = useMemo(
    () => resolveWidgetOptions(widget, t),
    [t, widget],
  );

  const allOptions = useMemo(() => {
    const known = new Set(options.map((option) => option.value));
    return [
      ...options,
      ...extraOptions.filter((option) => !known.has(option.value)),
    ];
  }, [options, extraOptions]);

  const isSuggestable = SUGGESTABLE_FIELDS.has(widget.field);

  const limit = widget.maxSelections ?? allOptions.length;
  const atLimit = selected.length >= limit;

  const toggle = (value: string) => {
    setSelected((current) => {
      if (current.includes(value))
        return current.filter((entry) => entry !== value);
      if (current.length >= limit) return current;
      return [...current, value];
    });
  };

  const pickSuggestion = (option: T.TRoadmapSuggestionOption) => {
    setExtraOptions((current) =>
      current.some((entry) => entry.value === option.value)
        ? current
        : [...current, option],
    );
    if (widget.type === "MULTI_SELECT") toggle(option.value);
    else onAnswer(option.value, option.label);
  };

  const selectionLabel = useMemo(
    () =>
      t("professionalRoadmapChat.widget.selectedOfMax", {
        selected: selected.length,
        max: limit,
      }),
    [limit, selected.length, t],
  );

  if (widget.type === "TEXT") return null;

  if (widget.type === "DATE") {
    const toIsoDate = (value: Date) => value.toISOString().slice(0, 10);
    const quickPicks = [
      {
        label: t("professionalRoadmapChat.widget.quickInThreeMonths"),
        date: () => {
          const value = new Date();
          value.setMonth(value.getMonth() + 3);
          return value;
        },
      },
      {
        label: t("professionalRoadmapChat.widget.quickInSixMonths"),
        date: () => {
          const value = new Date();
          value.setMonth(value.getMonth() + 6);
          return value;
        },
      },
      {
        label: t("professionalRoadmapChat.widget.quickEndOfYear"),
        date: () => new Date(new Date().getFullYear(), 11, 31),
      },
    ];

    return (
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap gap-2" role="group">
          {quickPicks.map((pick) => (
            <Button
              size="sm"
              key={pick.label}
              variant="outline"
              disabled={disabled}
              className={CHIP_CLASS_NAME}
              onClick={() => onAnswer(toIsoDate(pick.date()), pick.label)}
            >
              {pick.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            value={date}
            disabled={disabled}
            className="h-9 w-auto rounded-full"
            onChange={(event) => setDate(event.target.value)}
            aria-label={t("professionalRoadmapChat.widget.chooseDate")}
          />
          <Button
            size="sm"
            radius="full"
            disabled={disabled || !date}
            onClick={() =>
              onAnswer(
                date,
                new Date(`${date}T00:00:00.000Z`).toLocaleDateString(),
              )
            }
          >
            {t("professionalRoadmapChat.widget.useDate")}
          </Button>
        </div>
      </div>
    );
  }

  if (widget.type === "YES_NO" || widget.type === "SINGLE_SELECT")
    return (
      <div className="flex flex-wrap items-center gap-2" role="group">
        {(widget.type === "YES_NO" ? options : allOptions).map((option) => (
          <Button
            size="sm"
            variant="outline"
            key={option.value}
            disabled={disabled}
            className={CHIP_CLASS_NAME}
            onClick={() => onAnswer(option.value, option.label)}
          >
            {option.label}
          </Button>
        ))}
        {widget.type === "SINGLE_SELECT" && isSuggestable ? (
          <RoadmapSuggestionExpansion
            draftId={draftId}
            disabled={disabled}
            field={widget.field}
            onPick={pickSuggestion}
          />
        ) : null}
      </div>
    );

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-2" role="group">
        {allOptions.map((option) => {
          const isSelected = selected.includes(option.value);

          return (
            <Button
              size="sm"
              variant="outline"
              key={option.value}
              aria-pressed={isSelected}
              onClick={() => toggle(option.value)}
              disabled={disabled || (atLimit && !isSelected)}
              className={cn(
                CHIP_CLASS_NAME,
                isSelected && SELECTED_CHIP_CLASS_NAME,
                atLimit && !isSelected && "opacity-50",
              )}
            >
              {isSelected ? <Check aria-hidden className="size-3.5" /> : null}
              {option.label}
            </Button>
          );
        })}
        {isSuggestable ? (
          <RoadmapSuggestionExpansion
            draftId={draftId}
            field={widget.field}
            disabled={disabled}
            onPick={pickSuggestion}
          />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          radius="full"
          disabled={disabled || selected.length === 0}
          onClick={() => {
            const labels = selected.map(
              (value) =>
                allOptions.find((option) => option.value === value)?.label ??
                value,
            );
            onAnswer(selected.join(", "), labels.join(", "));
          }}
        >
          {t("professionalRoadmapChat.widget.confirmSelection")}
        </Button>

        <span
          aria-live="polite"
          className="text-xs tabular-nums text-muted-foreground"
        >
          {selectionLabel}
        </span>
      </div>
    </div>
  );
};
