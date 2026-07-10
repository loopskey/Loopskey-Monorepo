"use client";

import { TPduActivityFiltersProps } from "@/types/professional-dashboard.types";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";

import * as L from "lucide-react";

export const ActivitiesFilters = ({
  t,
  filters,
  onChange,
  onReset,
  isFiltered,
}: TPduActivityFiltersProps) => {
  const prefix = "professionalDashboard.cpdPduTracker.filters";

  return (
    <div className="rounded-[1.75rem] border border-glass-border bg-background/40 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full space-y-2 lg:max-w-md">
          <Label className="text-xs font-medium text-muted-foreground">
            {t(`${prefix}.search`)}
          </Label>
          <div className="relative">
            <L.Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(event) => onChange("search", event.target.value)}
              placeholder={t(`${prefix}.searchPlaceholder`)}
              className="h-11 rounded-2xl bg-background/60 pl-9"
            />
          </div>
        </div>

        {isFiltered && (
          <Button
            type="button"
            radius="xl"
            variant="cancel"
            onClick={onReset}
            className="self-start lg:self-auto"
          >
            <L.FilterX className="h-4 w-4" />
            {t(`${prefix}.clear`)}
          </Button>
        )}
      </div>
    </div>
  );
};
