"use client";

import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { BarList } from "@elements/charts/bar-list";

import type { TRequirementCategoryProgressProps } from "@/types/professional-requirement.types";

const KEY = "cpdProgress.requirements";

export const RequirementCategoryProgress = ({
  t,
  isLoading,
  categories,
  creditLabel,
}: TRequirementCategoryProgressProps) => (
  <GlassCard>
    <h2 className="mb-3 text-sm font-medium">{t(`${KEY}.categoriesTitle`)}</h2>

    {isLoading ? (
      <div className="space-y-3" aria-busy="true">
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
    ) : categories.length === 0 ? (
      <p className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
        {t(`${KEY}.categoriesEmpty`)}
      </p>
    ) : (
      <BarList
        label={t(`${KEY}.categoriesTitle`)}
        valueName={t(`${KEY}.categoryCompleted`)}
        targetName={t(`${KEY}.categoryRequired`)}
        formatValue={(value) => value.toLocaleString()}
        rows={categories.map((category) => ({
          id: category.id,
          label: category.name,
          value: category.completed,
          target: category.required,
          valueLabel: t(`${KEY}.categoryProgress`, {
            completed: category.completed,
            required: category.required,
            credit: creditLabel,
          }),
        }))}
      />
    )}
  </GlassCard>
);

export default RequirementCategoryProgress;
