"use client";

import { TOrgAssignmentStats } from "@/types/org-dashboard.types";
import { GlassCard } from "@elements/glass-card";
import { Progress } from "@ui/progress";

export const OrgAssignmentsStats = ({ hook }: TOrgAssignmentStats) => {
  const { t, stats } = hook;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <GlassCard>
        <div className="relative z-10">
          <p className="text-sm text-muted-foreground">
            {t("organizationDashboard.assignments.stats.total")}
          </p>

          <p className="mt-3 text-3xl font-semibold">
            {stats?.totalAssignments ?? 0}
          </p>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="relative z-10">
          <p className="text-sm text-muted-foreground">
            {t("organizationDashboard.assignments.stats.participants")}
          </p>

          <p className="mt-3 text-3xl font-semibold">
            {stats?.totalParticipants ?? 0}
          </p>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="relative z-10">
          <p className="text-sm text-muted-foreground">
            {t("organizationDashboard.assignments.stats.completion")}
          </p>

          <p className="mt-3 text-3xl font-semibold">
            {Math.round(stats?.averageCompletionRate ?? 0)}%
          </p>

          <Progress
            value={stats?.averageCompletionRate ?? 0}
            className="mt-4"
          />
        </div>
      </GlassCard>
    </div>
  );
};
