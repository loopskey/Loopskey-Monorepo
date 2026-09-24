"use client";

import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Progress } from "@ui/progress";

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
      <ul className="space-y-3">
        {categories.map((category) => (
          <li key={category.id} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate">{category.name}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {t(`${KEY}.categoryProgress`, {
                  completed: category.completed,
                  required: category.required,
                  credit: creditLabel,
                })}
              </span>
            </div>
            <Progress value={Math.min(category.percent, 100)} className="h-1.5" />
          </li>
        ))}
      </ul>
    )}
  </GlassCard>
);

export default RequirementCategoryProgress;
