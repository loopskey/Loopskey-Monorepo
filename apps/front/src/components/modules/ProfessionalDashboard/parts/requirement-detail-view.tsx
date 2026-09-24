"use client";

import { RequirementCategoryProgress } from "@modules/ProfessionalDashboard/parts/requirement-category-progress";
import { RequirementLearningContent } from "@modules/ProfessionalDashboard/parts/requirement-learning-content";
import { RequirementActivitiesTable } from "@modules/ProfessionalDashboard/parts/requirement-activities-table";
import { RequirementSummaryStrip } from "@modules/ProfessionalDashboard/parts/requirement-summary-strip";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";

import type { TRequirementDetailViewProps } from "@/types/professional-requirement.types";

const KEY = "cpdProgress.requirements";

const SummarySkeleton = () => (
  <GlassCard className="flex items-center gap-4">
    <Skeleton className="h-[88px] w-[88px] shrink-0 rounded-full" />
    <div className="min-w-0 flex-1 space-y-2">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  </GlassCard>
);

export const RequirementDetailView = ({
  t,
  model,
  onEdit,
  content,
  onDelete,
  isLoading,
  categories,
  activities,
  isDeleting,
  onMarkComplete,
  isDetailLoading,
  isActivitiesLoading,
}: TRequirementDetailViewProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <SummarySkeleton />
        <div className="grid gap-6 xl:grid-cols-2">
          <GlassCard>
            <Skeleton className="h-4 w-32" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </GlassCard>
          <GlassCard>
            <Skeleton className="h-4 w-40" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </GlassCard>
        </div>
        <GlassCard>
          <Skeleton className="h-4 w-28" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RequirementSummaryStrip
        t={t}
        model={model}
        onEdit={onEdit}
        onDelete={onDelete}
        isDeleting={isDeleting}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <RequirementCategoryProgress
          t={t}
          isLoading={isDetailLoading}
          categories={categories}
          creditLabel={t(`cpdProgress.creditTypes.${model.creditType}`)}
        />
        <RequirementLearningContent
          t={t}
          contents={content}
          isLoading={isDetailLoading}
          onMarkComplete={onMarkComplete ?? (() => {})}
        />
      </div>

      <RequirementActivitiesTable t={t} isLoading={isActivitiesLoading} rows={activities} />

      {model.source === "ASSOCIATION" ? (
        <p className="text-xs text-muted-foreground">{t(`${KEY}.managedBy`)}</p>
      ) : null}
    </div>
  );
};

export default RequirementDetailView;
