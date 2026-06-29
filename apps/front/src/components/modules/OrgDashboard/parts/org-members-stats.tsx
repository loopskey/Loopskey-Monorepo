"use client";

import { TOrgMembersStats } from "@/types/org-dashboard.types";
import { GlassCard } from "@elements/glass-card";
import { Progress } from "@ui/progress";

import * as L from "lucide-react";

export const OrgMembersStats = ({ t, stats, totalCount }: TOrgMembersStats) => {
  const totalMembers = stats?.totalMembers ?? totalCount;
  const activeMembers = stats?.activeMembers ?? 0;
  const inactiveMembers = stats?.inactiveMembers ?? 0;
  const avgCompliance = stats?.averageCompliance ?? 0;
  const totalPdus = stats?.totalPdus ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <GlassCard>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t("organizationDashboard.members.stats.total")}
            </p>
            <L.Users className="h-5 w-5 text-primary" />
          </div>

          <p className="mt-3 text-3xl font-semibold">{totalMembers}</p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600">
              {t("organizationDashboard.members.stats.active")}:{" "}
              <b>{activeMembers}</b>
            </div>

            <div className="rounded-2xl bg-muted p-3 text-muted-foreground">
              {t("organizationDashboard.members.stats.inactive")}:{" "}
              <b>{inactiveMembers}</b>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t("organizationDashboard.members.stats.avgCompliance")}
            </p>
            <L.Activity className="h-5 w-5 text-primary" />
          </div>

          <p className="mt-3 text-3xl font-semibold">
            {Math.round(avgCompliance)}%
          </p>

          <Progress value={avgCompliance} className="mt-4" />
        </div>
      </GlassCard>

      <GlassCard>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t("organizationDashboard.members.stats.totalPdus")}
            </p>
            <L.Target className="h-5 w-5 text-primary" />
          </div>

          <p className="mt-3 text-3xl font-semibold">{totalPdus.toFixed(2)}</p>

          <p className="mt-2 text-sm text-muted-foreground">
            {t("organizationDashboard.members.stats.totalPdusHint")}
          </p>
        </div>
      </GlassCard>
    </div>
  );
};
