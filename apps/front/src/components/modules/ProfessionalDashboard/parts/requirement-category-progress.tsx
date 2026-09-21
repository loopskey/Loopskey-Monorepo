"use client";

import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Progress } from "@ui/progress";
import { Badge } from "@ui/badge";

import type { TRequirementCategoryProgressProps } from "@/types/professional-requirement.types";

const KEY = "cpdProgress.requirements";

export const RequirementCategoryProgress = ({
  t,
  isLoading,
  categories,
  creditLabel,
}: TRequirementCategoryProgressProps) => (
  <GlassCard>
    <div className="mb-5">
      <h2 className="text-xl font-medium">{t(`${KEY}.categoriesTitle`)}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t(`${KEY}.categoriesSubtitle`)}
      </p>
    </div>

    {isLoading ? (
      <div className="space-y-3" aria-busy="true">
        <Skeleton className="h-16 w-full rounded-md" />
        <Skeleton className="h-16 w-full rounded-md" />
      </div>
    ) : categories.length === 0 ? (
      <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        {t(`${KEY}.categoriesEmpty`)}
      </div>
    ) : (
      <div className="space-y-4">
        {categories.map((category) => {
          const isComplete =
            category.requiredCredits > 0 &&
            category.completedCredits >= category.requiredCredits;

          return (
            <div key={category.id} className="rounded-md border p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{category.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(`${KEY}.categoryProgress`, {
                      completed: category.completedCredits,
                      required: category.requiredCredits,
                      credit: creditLabel,
                    })}
                  </p>
                </div>

                <Badge variant={isComplete ? "default" : "secondary"}>
                  {`${Math.min(Math.round(category.percent), 100)}%`}
                </Badge>
              </div>

              <Progress
                value={Math.min(category.percent, 100)}
                className="h-2.5"
              />
            </div>
          );
        })}
      </div>
    )}
  </GlassCard>
);
