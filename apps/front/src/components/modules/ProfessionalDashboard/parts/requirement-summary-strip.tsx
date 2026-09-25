"use client";

import { RequirementProgressRing } from "@modules/ProfessionalDashboard/parts/requirement-progress-ring";
import { RequirementSourceBadge } from "@modules/ProfessionalDashboard/parts/requirement-source-badge";
import { deadlineText, REQUIREMENT_TONE_CLASSES } from "@/utils/professional-requirement.helper";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { cn } from "@/lib/utils";

import type { TRequirementSummaryStripProps } from "@/types/professional-requirement.types";

import * as L from "lucide-react";

const KEY = "cpdProgress.requirements";

export const RequirementSummaryStrip = ({
  t,
  model,
  onEdit,
  onDelete,
  isDeleting,
}: TRequirementSummaryStripProps) => {
  const creditLabel = t(`cpdProgress.creditTypes.${model.creditType}`);
  const statusLabel = t(model.statusLabelKey);

  const evidenceLine = model.evidence
    ? model.evidence.awaitingReviewCount > 0
      ? t(`${KEY}.awaitingReview`, { count: model.evidence.awaitingReviewCount })
      : t(`${KEY}.evidenceOk`)
    : null;

  return (
    <GlassCard className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <RequirementProgressRing
          percent={model.percent}
          ariaLabel={t(`${KEY}.chartAria`, {
            earned: model.earnedCredits,
            total: model.requiredCredits,
            credit: creditLabel,
            percent: Math.round(model.percent),
          })}
        />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-medium">{model.title}</h2>
            <RequirementSourceBadge t={t} source={model.source} />
          </div>
          {model.associationName ? (
            <p className="truncate text-xs text-muted-foreground">
              {t(`${KEY}.assignedBy`, { association: model.associationName })}
            </p>
          ) : null}
          <p className="mt-1 text-sm font-medium tabular-nums">
            {t(`${KEY}.summaryProgress`, {
              earned: model.earnedCredits,
              total: model.requiredCredits,
              credit: creditLabel,
            })}
          </p>
          {model.remainingCredits > 0 ? (
            <p className="text-xs text-muted-foreground tabular-nums">
              {t(`${KEY}.toGo`, {
                amount: model.remainingCredits,
                credit: creditLabel,
              })}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:flex-col sm:items-end">
        <div className="flex items-center gap-2">
          <Badge className={cn("border-transparent", REQUIREMENT_TONE_CLASSES[model.statusTone])}>
            {statusLabel}
          </Badge>
          {onEdit || onDelete ? (
            <div className="flex items-center gap-1">
              {onEdit ? (
                <Button
                  size="sm"
                  radius="xl"
                  type="button"
                  variant="outline"
                  onClick={onEdit}
                  aria-label={t("cpdProgress.progress.editPlan")}
                >
                  <L.Pencil className="h-3.5 w-3.5" />
                </Button>
              ) : null}
              {onDelete ? (
                <Button
                  size="sm"
                  radius="xl"
                  type="button"
                  variant="ghost"
                  disabled={isDeleting}
                  onClick={onDelete}
                  aria-label={t("cpdProgress.progress.deletePlan")}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <L.Trash2 className="h-3.5 w-3.5" />
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        <p className="text-xs text-muted-foreground">
          {deadlineText(t, model.dueDate, model.daysRemaining)}
        </p>

        {evidenceLine ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <L.FileCheck2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {evidenceLine}
          </p>
        ) : null}
      </div>
    </GlassCard>
  );
};

export default RequirementSummaryStrip;
