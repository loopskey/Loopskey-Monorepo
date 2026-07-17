"use client";

import { CpdCategoryCompletionProps } from "@/types/cpd-plan.types";
import { GlassCard } from "@elements/glass-card";
import { Progress } from "@ui/progress";
import { Badge } from "@ui/badge";

export const CpdCategoryCompletion = ({
  t,
  plan,
  progress,
}: CpdCategoryCompletionProps) => {
  const creditLabel = t(`cpdProgress.creditTypes.${plan.creditType}`);

  return (
    <GlassCard>
      <div className="mb-5">
        <h2 className="text-xl font-medium">
          {t("cpdProgress.progress.categoryTitle")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("cpdProgress.progress.categorySubtitle")}
        </p>
      </div>

      {progress.categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-glass-border bg-background/40 p-8 text-center text-sm text-muted-foreground">
          {t("cpdProgress.progress.noCategories")}
        </div>
      ) : (
        <div className="space-y-4">
          {progress.categories.map((category) => (
            <div
              key={category.id}
              className="rounded-2xl border border-glass-border bg-background/40 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {category.completed} / {category.target} {creditLabel}
                    {category.remaining > 0 && (
                      <>
                        {" · "}
                        {t("cpdProgress.progress.categoryRemaining")}:{" "}
                        {category.remaining}
                      </>
                    )}
                  </p>
                </div>

                <Badge variant={category.isComplete ? "default" : "secondary"}>
                  {category.isComplete
                    ? t("cpdProgress.progress.categoryComplete")
                    : `${category.progress.toFixed(0)}%`}
                </Badge>
              </div>

              <Progress
                value={Math.min(category.progress, 100)}
                className="h-2.5"
              />
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};
