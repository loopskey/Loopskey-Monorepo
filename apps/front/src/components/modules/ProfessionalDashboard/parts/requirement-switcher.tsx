"use client";

import { Button } from "@ui/button";

import type { TRequirementSwitcherProps } from "@/types/professional-requirement.types";

import * as L from "lucide-react";
import * as D from "@ui/dropdown-menu";

export const RequirementSwitcher = ({
  t,
  options,
  onSelect,
  selectedKey,
}: TRequirementSwitcherProps) => {
  if (options.length < 2) return null;

  return (
    <D.DropdownMenu>
      <D.DropdownMenuTrigger asChild>
        <Button
          size="sm"
          radius="xl"
          type="button"
          variant="outline"
          className="shrink-0"
          aria-label={t("professionalDashboard.overview.cpdCard.switchButton")}
        >
          <L.ChevronsUpDown className="h-4 w-4" aria-hidden />
          {t("professionalDashboard.overview.cpdCard.switchButton")}
        </Button>
      </D.DropdownMenuTrigger>

      <D.DropdownMenuContent align="end" className="w-64">
        <D.DropdownMenuLabel>
          {t("professionalDashboard.overview.cpdCard.switchLabel")}
        </D.DropdownMenuLabel>
        <D.DropdownMenuSeparator />
        <D.DropdownMenuRadioGroup
          value={selectedKey ?? undefined}
          onValueChange={onSelect}
        >
          {options.map((option) => (
            <D.DropdownMenuRadioItem key={option.key} value={option.key}>
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{option.label}</span>
                <span className="text-xs text-muted-foreground">
                  {t(`cpdProgress.requirements.source.${option.source}`)}
                </span>
              </span>
            </D.DropdownMenuRadioItem>
          ))}
        </D.DropdownMenuRadioGroup>
      </D.DropdownMenuContent>
    </D.DropdownMenu>
  );
};
