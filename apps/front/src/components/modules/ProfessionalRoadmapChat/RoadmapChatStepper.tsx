"use client";

import { ROADMAP_STAGE_ORDER } from "@/utils/roadmap-chat-step.util";
import { RoadmapDraftStep } from "@/lib/graphql/base";
import { roadmapStageOf } from "@/utils/roadmap-chat-step.util";
import { cn } from "@/lib/utils";

import * as L from "lucide-react";

const STAGE_LABEL_KEY = "professionalRoadmapChat.stepper";

type TRoadmapChatStepperProps = {
  currentStep: RoadmapDraftStep;
  t: (key: string, values?: Record<string, string | number>) => string;
};

export const RoadmapChatStepper = ({
  currentStep,
  t,
}: TRoadmapChatStepperProps) => {
  const activeStage = roadmapStageOf(currentStep);
  const activeIndex = ROADMAP_STAGE_ORDER.indexOf(activeStage);

  return (
    <ol className="flex flex-wrap items-center gap-2 sm:gap-3">
      {ROADMAP_STAGE_ORDER.map((stage, index) => {
        const isComplete = index < activeIndex;
        const isCurrent = index === activeIndex;
        return (
          <li key={stage} className="flex items-center gap-2 sm:gap-3">
            <div
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium sm:text-sm",
                isCurrent
                  ? "border-primary bg-primary/10 text-primary"
                  : isComplete
                    ? "border-primary/40 text-primary"
                    : "border-border text-muted-foreground",
              )}
            >
              {isComplete ? (
                <L.CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              ) : (
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full text-[10px]",
                    isCurrent ? "bg-primary text-primary-foreground" : "border",
                  )}
                >
                  {index + 1}
                </span>
              )}
              {t(`${STAGE_LABEL_KEY}.${stage}`)}
            </div>

            {index < ROADMAP_STAGE_ORDER.length - 1 ? (
              <L.ChevronRight
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
};
