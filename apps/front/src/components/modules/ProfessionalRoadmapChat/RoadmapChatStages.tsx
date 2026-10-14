"use client";

import { ROADMAP_STAGE_ORDER } from "@/utils/roadmap-chat-step.util";
import { ROADMAP_STAGE_STEPS } from "@/utils/roadmap-chat-step.util";
import { roadmapStageOf } from "@/utils/roadmap-chat-step.util";
import { useI18n } from "@/hooks/useI18n";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

import type { RoadmapChatStagesProps } from "@/types/professional-roadmap-chat.types";
import type { RoadmapChatStage } from "@/utils/roadmap-chat-step.util";
import type { TRoadmapDraft } from "@/types/professional-roadmap-chat.types";

const KEY = "professionalRoadmapChat";

const PREFERENCE_REQUIRED_FIELDS = [
  "skillLevel",
  "timeCommitment",
  "subjects",
  "budgetPreference",
] as const;

const currentStageProgress = (
  draft: TRoadmapDraft,
  stage: RoadmapChatStage,
) => {
  if (stage === "review") return draft.canGenerate ? 100 : 0;
  if (stage === "preferences") {
    const missing = new Set(draft.missingFields);
    const answered = PREFERENCE_REQUIRED_FIELDS.filter(
      (field) => !missing.has(field),
    ).length;
    return (answered / PREFERENCE_REQUIRED_FIELDS.length) * 100;
  }
  const steps = ROADMAP_STAGE_STEPS[stage];
  return (Math.max(steps.indexOf(draft.currentStep), 0) / steps.length) * 100;
};

export const RoadmapChatStages = ({ draft }: RoadmapChatStagesProps) => {
  const { t } = useI18n();
  const currentStage = roadmapStageOf(draft.currentStep);
  const currentIndex = ROADMAP_STAGE_ORDER.indexOf(currentStage);

  return (
    <div className="px-4 pt-3.5 sm:px-5">
      <ol aria-label={t(`${KEY}.stagesLabel`)} className="flex gap-1.5">
        {ROADMAP_STAGE_ORDER.map((stage, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const progress = isDone
            ? 100
            : isCurrent
              ? currentStageProgress(draft, stage)
              : 0;

          return (
            <li
              key={stage}
              aria-current={isCurrent ? "step" : undefined}
              className="min-w-0 flex-1 space-y-1.5"
            >
              <span className="block h-1 overflow-hidden rounded-full bg-muted">
                <span
                  style={{ width: `${progress}%` }}
                  className={cn(
                    "block h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none",
                    isDone ? "bg-success" : "bg-primary",
                  )}
                />
              </span>
              <span
                className={cn(
                  "flex items-center gap-1.5 truncate text-xs max-sm:sr-only",
                  isCurrent
                    ? "font-semibold text-primary"
                    : isDone
                      ? "text-foreground"
                      : "text-muted-foreground",
                )}
              >
                {isDone ? (
                  <Check aria-hidden className="size-3.5 text-success" />
                ) : (
                  <span aria-hidden className="tabular-nums">
                    {index + 1}
                  </span>
                )}
                {t(`${KEY}.stepper.${stage}`)}
              </span>
            </li>
          );
        })}
      </ol>

      <p
        aria-hidden
        className="mt-1.5 text-xs font-semibold text-primary sm:hidden"
      >
        {t(`${KEY}.stageOf`, {
          current: currentIndex + 1,
          total: ROADMAP_STAGE_ORDER.length,
        })}
        {" · "}
        {t(`${KEY}.stepper.${currentStage}`)}
      </p>
    </div>
  );
};
