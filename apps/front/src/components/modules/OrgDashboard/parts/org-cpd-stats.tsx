"use client";

import { TCPDStats } from "@/types/org-dashboard.types";
import { GlassCard } from "@elements/glass-card";

export const OrgCpdCategoryStats = ({ hook }: TCPDStats) => {
  const { t, stats } = hook;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <GlassCard>
        <div className="relative z-10">
          <p className="text-sm text-muted-foreground">
            {t("organizationDashboard.cpd.summary.totalCategories")}
          </p>
          <p className="mt-3 text-3xl font-medium">
            {stats?.totalCategories ?? 0}
          </p>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="relative z-10">
          <p className="text-sm text-muted-foreground">
            {t("organizationDashboard.cpd.summary.totalRequiredHours")}
          </p>
          <p className="mt-3 text-3xl font-medium">
            {stats?.totalRequiredHours ?? 0}
          </p>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="relative z-10">
          <p className="text-sm text-muted-foreground">
            {t("organizationDashboard.cpd.summary.mostPopularCategory")}
          </p>
          <p className="mt-3 line-clamp-1 text-xl font-medium">
            {stats?.mostPopularCategory ?? "-"}
          </p>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="relative z-10">
          <p className="text-sm text-muted-foreground">
            {t("organizationDashboard.cpd.summary.activeMembers")}
          </p>
          <p className="mt-3 text-3xl font-medium">
            {stats?.mostPopularActiveMembers ?? 0}
          </p>
        </div>
      </GlassCard>
    </div>
  );
};
