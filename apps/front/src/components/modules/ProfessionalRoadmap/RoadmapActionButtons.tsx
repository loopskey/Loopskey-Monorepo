"use client";

import { RoadmapEnrollmentStatus, RoadmapSource } from "@/lib/graphql/base";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import type { TRoadmapActionButtonsProps } from "@/types/professional-roadmap-chat.types";

import * as L from "lucide-react";

const KEY = "professionalDashboard.roadmap.actions";

export const RoadmapActionButtons = ({
  size,
  roadmap,
  onEdit,
  className,
  onContinue,
  editingRoadmapId,
}: TRoadmapActionButtonsProps) => {
  const { t } = useI18n();

  const isCompleted =
    roadmap.status === RoadmapEnrollmentStatus.Completed ||
    roadmap.progress >= 100;
  const canEdit =
    roadmap.source === RoadmapSource.Generated && Boolean(roadmap.draftId);
  const isStartingEdit = editingRoadmapId === roadmap.roadmapId;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        size={size}
        type="button"
        className="min-w-0 flex-1"
        onClick={() => onContinue(roadmap.id)}
        aria-label={t(
          isCompleted ? `${KEY}.reviewLabel` : `${KEY}.continueLabel`,
          { title: roadmap.title },
        )}
      >
        {isCompleted ? <L.ListChecks aria-hidden /> : <L.Play aria-hidden />}
        <span className="truncate">
          {t(isCompleted ? `${KEY}.review` : `${KEY}.continue`)}
        </span>
      </Button>

      {canEdit ? (
        <Button
          size={size}
          type="button"
          variant="outline"
          className="min-w-0 flex-1"
          disabled={Boolean(editingRoadmapId)}
          onClick={() => onEdit(roadmap.roadmapId)}
          aria-label={t(`${KEY}.editLabel`, { title: roadmap.title })}
        >
          {isStartingEdit ? (
            <L.Loader2 aria-hidden className="animate-spin" />
          ) : (
            <L.Pencil aria-hidden />
          )}
          <span className="truncate">{t(`${KEY}.edit`)}</span>
        </Button>
      ) : null}
    </div>
  );
};
