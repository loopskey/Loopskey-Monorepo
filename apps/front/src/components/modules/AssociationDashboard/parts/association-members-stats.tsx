"use client";

import { TAssociationMembersStats } from "@/types/association-dashboard.types";
import { StatCardGrid } from "@elements/stat-card/stat-card-grid";
import { StatCard } from "@elements/stat-card/stat-card";

import * as L from "lucide-react";

export const AssociationMembersStats = ({ hook }: TAssociationMembersStats) => {
  const { t, stats, isLoading } = hook;

  return (
    <StatCardGrid columns={3}>
      <StatCard
        icon={L.Users}
        isLoading={isLoading}
        value={stats?.totalMembers ?? 0}
        title={t("associationDashboard.members.stats.total")}
      />

      <StatCard
        icon={L.UserCheck}
        isLoading={isLoading}
        value={stats?.activeMembers ?? 0}
        title={t("associationDashboard.members.stats.active")}
      />

      <StatCard
        icon={L.MailQuestion}
        isLoading={isLoading}
        value={stats?.pendingActivation ?? 0}
        title={t("associationDashboard.members.stats.pending")}
      />
    </StatCardGrid>
  );
};
