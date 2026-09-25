"use client";

import { TLearningActivitiesSummaryStripProps } from "@/types/professional-dashboard.types";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";

import * as L from "lucide-react";

const TRACKER = "professionalDashboard.cpdPduTracker";

export const LearningActivitiesSummaryStrip = ({
  t,
  summary,
  isError,
  isLoading,
}: TLearningActivitiesSummaryStripProps) => {
  if (isLoading) return <Skeleton className="h-16 w-full rounded-lg" />;

  const count = (value: number | undefined) =>
    isError ? "—" : String(value ?? 0);

  return (
    <GlassCard className="p-0 md:p-0">
      <div className="grid grid-cols-2 divide-x divide-border">
        <div className="flex min-h-16 items-center gap-2.5 px-4 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-soft-foreground">
            <L.CircleCheckBig className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-medium tabular-nums">
              {count(summary?.completedActivities)}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {t(`${TRACKER}.summary.completedTitle`)}
            </span>
          </span>
        </div>

        <div className="flex min-h-16 items-center gap-2.5 px-4 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <L.Paperclip className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-medium tabular-nums">
              {count(summary?.activitiesWithEvidence)}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {t(`${TRACKER}.summary.evidenceTitle`)}
              {!isError
                ? ` · ${t(`${TRACKER}.summary.evidenceHelper`, { files: summary?.evidenceFilesCount ?? 0 })}`
                : ""}
            </span>
          </span>
        </div>
      </div>
    </GlassCard>
  );
};
