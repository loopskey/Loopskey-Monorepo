"use client";

import { RequirementExcludedActivities } from "@modules/ProfessionalDashboard/parts/requirement-excluded-activities";
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
  activities,
  isDeleting,
  isDetailLoading,
  requirementKeyValue,
  isActivitiesLoading,
  excludedActivities = [],
}: TRequirementDetailViewProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <SummarySkeleton />
        <GlassCard>
          <Skeleton className="h-4 w-40" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </GlassCard>
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

      <RequirementLearningContent
        t={t}
        contents={content}
        isLoading={isDetailLoading}
        associationName={model.associationName}
        requirementKeyValue={requirementKeyValue}
      />

      <RequirementActivitiesTable
        t={t}
        rows={activities}
        isLoading={isActivitiesLoading}
      />

      <RequirementExcludedActivities t={t} activities={excludedActivities} />

      {model.source === "ASSOCIATION" ? (
        <p className="text-xs text-muted-foreground">{t(`${KEY}.managedBy`)}</p>
      ) : null}
    </div>
  );
};

export default RequirementDetailView;
