"use client";

import { LearningActivitiesSummaryStrip } from "@modules/ProfessionalDashboard/parts/learning-activities-summary-strip";
import { useProfessionalCpdPduTracker } from "@/hooks/useProfessionalCpdPduTracker";
import { CycleProgressCard } from "@modules/ProfessionalDashboard/parts/cycle-progress-card";
import { ActivitiesTable } from "@modules/ProfessionalDashboard/parts/activities-table";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import * as L from "lucide-react";

const TRACKER = "professionalDashboard.cpdPduTracker";

const ProfessionalCpdPduTrackerTab = () => {
  const hook = useProfessionalCpdPduTracker();

  const {
    t,
    summary,
    cyclePlan,
    cycleProgress,
    isCycleLoading,
    isSummaryError,
    isSummaryLoading,
    handleAddActivity,
  } = hook;

  return (
    <div className="space-y-6">
      {/* 1. Page title and primary actions */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-medium text-primary">
            {t(`${TRACKER}.eyebrow`)}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t(`${TRACKER}.title`)}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t(`${TRACKER}.subtitle`)}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            radius="xl"
            type="button"
            onClick={handleAddActivity}
            className="w-full justify-center sm:w-auto"
          >
            <L.FilePlus2 className="h-4 w-4" />
            {t(`${TRACKER}.quickActions.addActivity`)}
          </Button>
        </div>
      </div>

      {/* 2. Summary strip */}
      <LearningActivitiesSummaryStrip
        t={t}
        summary={summary}
        isError={isSummaryError}
        isLoading={isSummaryLoading}
      />

      {cyclePlan && (isCycleLoading || cycleProgress) ? (
        <CycleProgressCard
          t={t}
          plan={cyclePlan}
          progress={cycleProgress}
          isLoading={isCycleLoading}
        />
      ) : null}

      <GlassCard>
        <div className="mb-5">
          <h2 className="text-xl font-medium">
            {t(`${TRACKER}.activities.title`)}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(`${TRACKER}.activities.subtitle`)}
          </p>
        </div>

        <ActivitiesTable hook={hook} />
      </GlassCard>
    </div>
  );
};

export default ProfessionalCpdPduTrackerTab;
