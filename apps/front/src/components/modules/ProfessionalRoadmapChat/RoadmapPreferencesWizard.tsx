"use client";

import {
  DELIVERY_FORMATS,
  LEARNING_BUDGET_PREFERENCES,
  LEARNING_FORMATS,
  LEARNING_TIME_COMMITMENTS,
  SKILL_LEVELS,
} from "@/utils/professional-profile.constant";
import { useEffect, useMemo, useState } from "react";
import { Progress } from "@ui/progress";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import type { TRoadmapDraft } from "@/types/professional-roadmap-chat.types";
import type { Patch } from "@/types/professional-roadmap-chat.types";

const OPTION_NS = "professionalDashboard.profile.options";
const WIZARD_NS = "professionalRoadmapChat.preferencesWizard";

type TSingleStepKey = "skillLevel" | "timeCommitment" | "budgetPreference";
type TMultiStepKey = "preferredFormats" | "preferredDeliveryFormats";

type TStepConfig =
  | {
      key: TSingleStepKey;
      selectType: "single";
      values: readonly string[];
      labelNs: string;
    }
  | {
      key: TMultiStepKey;
      selectType: "multi";
      values: readonly string[];
      labelNs: string;
    }
  | { key: "subjects"; selectType: "subjects"; maxSelections: number };

const STEPS: readonly TStepConfig[] = [
  {
    key: "skillLevel",
    selectType: "single",
    values: SKILL_LEVELS,
    labelNs: `${OPTION_NS}.skillLevel`,
  },
  { key: "subjects", selectType: "subjects", maxSelections: 3 },
  {
    key: "preferredFormats",
    selectType: "multi",
    values: LEARNING_FORMATS,
    labelNs: `${OPTION_NS}.learningFormat`,
  },
  {
    key: "timeCommitment",
    selectType: "single",
    values: LEARNING_TIME_COMMITMENTS,
    labelNs: `${OPTION_NS}.learningTime`,
  },
  {
    key: "preferredDeliveryFormats",
    selectType: "multi",
    values: DELIVERY_FORMATS,
    labelNs: `${OPTION_NS}.deliveryFormat`,
  },
  {
    key: "budgetPreference",
    selectType: "single",
    values: LEARNING_BUDGET_PREFERENCES,
    labelNs: `${OPTION_NS}.budget`,
  },
] as const;

const currentValue = (draft: TRoadmapDraft, step: TStepConfig): string[] => {
  if (step.selectType === "subjects") return draft.subjects;
  if (step.selectType === "multi") return draft[step.key];
  const value = draft[step.key];
  return value ? [value] : [];
};

const isAnswered = (draft: TRoadmapDraft, step: TStepConfig): boolean =>
  currentValue(draft, step).length > 0;

type TProps = {
  draft: TRoadmapDraft;
  isPatching: boolean;
  onPatch: (changes: Patch) => void;
};

export const RoadmapPreferencesWizard = ({
  draft,
  isPatching,
  onPatch,
}: TProps) => {
  const { t } = useI18n();

  const firstUnanswered = useMemo(() => {
    const index = STEPS.findIndex((step) => !isAnswered(draft, step));
    return index === -1 ? STEPS.length - 1 : index;
  }, [draft]);

  const [stepIndex, setStepIndex] = useState<number>(firstUnanswered);
  const step = STEPS[stepIndex];
  const [selected, setSelected] = useState<string[]>(() =>
    currentValue(draft, step),
  );

  useEffect(() => {
    setSelected(currentValue(draft, STEPS[stepIndex]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  const subjectOptions = draft.subjectOptions;
  const optionLabel = (value: string) => {
    if (step.selectType === "subjects")
      return (
        subjectOptions.find((option) => option.id === value)?.label ?? value
      );
    return t(`${step.labelNs}.${value}`);
  };

  const options =
    step.selectType === "subjects"
      ? subjectOptions.map((option) => option.id)
      : step.values;

  const maxSelections =
    step.selectType === "subjects" ? step.maxSelections : undefined;
  const atLimit =
    maxSelections !== undefined && selected.length >= maxSelections;

  const toggle = (value: string) => {
    if (step.selectType === "single") {
      setSelected([value]);
      return;
    }
    setSelected((current) => {
      if (current.includes(value))
        return current.filter((entry) => entry !== value);
      if (maxSelections !== undefined && current.length >= maxSelections)
        return current;
      return [...current, value];
    });
  };

  const canConfirm = selected.length > 0 && !isPatching;

  const confirm = () => {
    if (!canConfirm) return;
    const value = step.selectType === "single" ? selected[0] : selected;
    onPatch({ [step.key]: value } as Patch);
    if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1);
  };

  const goBack = () => {
    if (stepIndex === 0) return;
    setStepIndex(stepIndex - 1);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          {t(`${WIZARD_NS}.stepOf`, {
            current: stepIndex + 1,
            total: STEPS.length,
          })}
        </p>
        <Progress
          value={((stepIndex + 1) / STEPS.length) * 100}
          aria-label={t(`${WIZARD_NS}.stepOf`, {
            current: stepIndex + 1,
            total: STEPS.length,
          })}
        />
      </div>

      <h2 className="text-lg font-medium">
        {t(`${WIZARD_NS}.questions.${step.key}`)}
      </h2>

      <div className="flex flex-wrap gap-2" role="group">
        {options.map((value) => {
          const isSelected = selected.includes(value);
          return (
            <Button
              radius="xl"
              key={value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggle(value)}
              variant={isSelected ? "default" : "outline"}
              disabled={isPatching || (atLimit && !isSelected)}
              className={cn(atLimit && !isSelected && "opacity-50")}
            >
              {optionLabel(value)}
            </Button>
          );
        })}
      </div>

      {maxSelections !== undefined ? (
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {t(`${WIZARD_NS}.maxSelected`, { max: maxSelections })}
        </p>
      ) : null}

      <div className="flex justify-between gap-3">
        <Button
          radius="xl"
          type="button"
          onClick={goBack}
          variant="outline"
          disabled={stepIndex === 0 || isPatching}
        >
          {t(`${WIZARD_NS}.back`)}
        </Button>

        <Button
          radius="xl"
          type="button"
          onClick={confirm}
          disabled={!canConfirm}
        >
          {t(`${WIZARD_NS}.confirm`)}
        </Button>
      </div>
    </div>
  );
};
