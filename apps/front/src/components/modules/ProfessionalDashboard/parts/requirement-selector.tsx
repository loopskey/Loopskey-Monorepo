"use client";

import { RequirementSourceBadge } from "@modules/ProfessionalDashboard/parts/requirement-source-badge";
import { parseRequirementKey } from "@/utils/professional-requirement.helper";
import { Button } from "@ui/button";

import type { TRequirementSelectorProps } from "@/types/professional-requirement.types";

import * as L from "lucide-react";
import * as S from "@ui/select";

export const RequirementSelector = ({
  t,
  options,
  onEdit,
  onSelect,
  onDelete,
  isDeleting,
  selectedKey,
  onLogActivity,
}: TRequirementSelectorProps) => {
  const active = parseRequirementKey(selectedKey);
  if (!active) return null;

  const isPlan = active.source === "PLAN";

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <span className="text-sm text-muted-foreground">
          {t("cpdProgress.requirements.selectorLabel")}
        </span>
        <S.Select value={selectedKey ?? undefined} onValueChange={onSelect}>
          <S.SelectTrigger
            aria-label={t("cpdProgress.requirements.selectorLabel")}
            className="h-11 w-full min-w-64 rounded-md bg-muted sm:w-auto"
          >
            <S.SelectValue
              placeholder={t("cpdProgress.requirements.selectorPlaceholder")}
            />
          </S.SelectTrigger>
          <S.SelectContent className="z-[9999] rounded-md">
            {options.map((option) => (
              <S.SelectItem key={option.key} value={option.key}>
                <span className="flex items-center gap-2">
                  <span className="truncate">{option.label}</span>
                  <RequirementSourceBadge t={t} source={option.source} />
                </span>
              </S.SelectItem>
            ))}
          </S.SelectContent>
        </S.Select>
      </div>

      {isPlan ? (
        <div className="grid grid-cols-3 gap-2 sm:flex sm:w-auto sm:items-center">
          <Button
            size="sm"
            radius="xl"
            type="button"
            onClick={onLogActivity}
            className="w-full justify-center sm:w-auto"
          >
            <L.Plus className="h-4 w-4" />
            {t("cpdProgress.requirements.logActivity")}
          </Button>

          <Button
            size="sm"
            radius="xl"
            type="button"
            variant="outline"
            onClick={() => onEdit(active.id)}
            className="w-full justify-center sm:w-auto"
          >
            <L.Pencil className="h-4 w-4" />
            {t("cpdProgress.progress.editPlan")}
          </Button>

          <Button
            size="sm"
            radius="xl"
            type="button"
            variant="ghost"
            disabled={isDeleting}
            onClick={() => onDelete(active.id)}
            className="w-full justify-center text-destructive hover:bg-destructive/10 sm:w-auto"
          >
            <L.Trash2 className="h-4 w-4" />
            {t("cpdProgress.progress.deletePlan")}
          </Button>
        </div>
      ) : (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <L.Lock aria-hidden className="h-4 w-4 shrink-0" />
          {t("cpdProgress.requirements.readOnly")}
        </p>
      )}
    </div>
  );
};
