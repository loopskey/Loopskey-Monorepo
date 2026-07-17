"use client";

import { CpdPlanSelectorProps } from "@/types/cpd-plan.types";
import { Button } from "@ui/button";

import * as L from "lucide-react";
import * as S from "@ui/select";

export const CpdPlanSelector = ({
  t,
  plans,
  onSelect,
  onDelete,
  isDeleting,
  selectedPlanId,
}: CpdPlanSelectorProps) => {
  if (!selectedPlanId) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {t("cpdProgress.progress.planLabel")}
        </span>
        <S.Select value={selectedPlanId} onValueChange={onSelect}>
          <S.SelectTrigger className="h-11 min-w-56 rounded-2xl bg-background/60">
            <S.SelectValue />
          </S.SelectTrigger>
          <S.SelectContent className="z-[9999] rounded-2xl">
            {plans.map((plan) => (
              <S.SelectItem key={plan.id} value={plan.id}>
                {plan.certificationName}
              </S.SelectItem>
            ))}
          </S.SelectContent>
        </S.Select>
      </div>

      <Button
        size="sm"
        radius="xl"
        type="button"
        variant="ghost"
        disabled={isDeleting}
        onClick={() => onDelete(selectedPlanId)}
        className="text-destructive hover:bg-destructive/10"
      >
        <L.Trash2 className="h-4 w-4" />
        {t("cpdProgress.progress.deletePlan")}
      </Button>
    </div>
  );
};
