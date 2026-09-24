"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { RoadmapDraftFieldKey } from "@/lib/graphql/base";
import { ROADMAP_CERTIFICATION_CHOICES } from "@/utils/roadmap-chat.constant";
import { ROADMAP_NO_VALUE } from "@/utils/roadmap-chat.constant";
import { ROADMAP_YES_VALUE } from "@/utils/roadmap-chat.constant";

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

  // The coach sends a control without options, because option labels are
  // copy and the browser owns copy. A provider widget brings its own.
  const options: T.TRoadmapWidgetOption[] = useMemo(() => {
    if (widget.options.length) return widget.options;
    if (widget.field === RoadmapDraftFieldKey.CpdEnabled)
      return [
        {
          value: ROADMAP_YES_VALUE,
          label: t("professionalRoadmapChat.widget.yes"),
        },
        {
          value: ROADMAP_NO_VALUE,
          label: t("professionalRoadmapChat.widget.no"),
        },
      ];
    if (widget.field === RoadmapDraftFieldKey.CertificationName)
      return ROADMAP_CERTIFICATION_CHOICES.map((value) => ({
        value,
        label: value,
      }));
    return [];
  }, [t, widget.field, widget.options]);

  const limit = widget.maxSelections ?? options.length;
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
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2" role="group">
          {quickPicks.map((pick) => (
            <Button
              radius="xl"
              key={pick.label}
              variant="outline"
              disabled={disabled}
              onClick={() => onAnswer(toIsoDate(pick.date()))}
            >
              {pick.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            value={date}
            className="w-auto"
            disabled={disabled}
            onChange={(event) => setDate(event.target.value)}
            aria-label={t("professionalRoadmapChat.widget.chooseDate")}
          />
          <Button
            radius="xl"
            disabled={disabled || !date}
            onClick={() => onAnswer(date)}
          >
            {t("professionalRoadmapChat.widget.useDate")}
          </Button>
        </div>
      </div>
    );
  }

  if (widget.type === "YES_NO")
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
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
        {options.map((option) => (
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
        {options.map((option) => {
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
