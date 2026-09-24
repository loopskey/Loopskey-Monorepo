"use client";

import { RequirementSourceBadge } from "@modules/ProfessionalDashboard/parts/requirement-source-badge";
import { Button } from "@ui/button";

import type { TRequirementSelectorProps } from "@/types/professional-requirement.types";

import * as L from "lucide-react";
import * as S from "@ui/select";

export const RequirementSelector = ({
  t,
  options,
  onSelect,
  selectedKey,
  onLogActivity,
}: TRequirementSelectorProps) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <S.Select value={selectedKey ?? undefined} onValueChange={onSelect}>
      <S.SelectTrigger
        aria-label={t("cpdProgress.requirements.selectorLabel")}
        className="h-11 w-full rounded-md bg-muted sm:w-auto sm:min-w-64"
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

    <Button
      radius="xl"
      type="button"
      onClick={onLogActivity}
      className="sticky bottom-4 z-10 w-full justify-center shadow-lg sm:static sm:w-auto sm:shrink-0 sm:shadow-none"
    >
      <L.Plus className="h-4 w-4" />
      {t("cpdProgress.requirements.logActivity")}
    </Button>
  </div>
);

export default RequirementSelector;
