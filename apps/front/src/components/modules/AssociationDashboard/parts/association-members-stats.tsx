"use client";

import { TAssociationMembersStats } from "@/types/association-dashboard.types";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";

import * as L from "lucide-react";

export const AssociationMembersStats = ({
  hook,
}: TAssociationMembersStats) => {
  const { t, stats, isLoading, locale } = hook;

  const cards = [
    {
      id: "total",
      icon: L.Users,
      value: stats?.totalMembers ?? 0,
      label: t("associationDashboard.members.stats.total"),
    },
    {
      id: "active",
      icon: L.UserCheck,
      value: stats?.activeMembers ?? 0,
      label: t("associationDashboard.members.stats.active"),
    },
    {
      id: "pending",
      icon: L.MailQuestion,
      value: stats?.pendingActivation ?? 0,
      label: t("associationDashboard.members.stats.pending"),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <GlassCard key={card.id} glow={false}>
          <div className="relative z-10 flex items-center gap-4">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <card.icon className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">{card.label}</p>

              {isLoading ? (
                <Skeleton className="mt-2 h-7 w-16" />
              ) : (
                <p className="text-2xl font-medium tabular-nums">
                  {card.value.toLocaleString(locale)}
                </p>
              )}
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};
