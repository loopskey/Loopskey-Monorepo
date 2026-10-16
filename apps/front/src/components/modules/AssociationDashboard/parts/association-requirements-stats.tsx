"use client";

import { TAssociationRequirementsStats } from "@/types/association-dashboard.types";
import { AssociationRequirementStatus } from "@/lib/graphql/base";
import { TRequirementStatCard } from "@utils/association-requirement";
import { statusForStatCard } from "@utils/association-requirement";
import { StatCardGrid } from "@elements/stat-card/stat-card-grid";
import { StatCard } from "@elements/stat-card/stat-card";

import * as L from "lucide-react";

export const AssociationRequirementsStats = ({
  hook,
}: TAssociationRequirementsStats) => {
  const { t, stats, status, isLoading, applyStatCard } = hook;

  const cards: Array<{
    id: TRequirementStatCard | "covered";
    icon: typeof L.ListChecks;
    value: number;
    clickable: boolean;
  }> = [
    {
      id: "total",
      icon: L.ListChecks,
      value: stats?.totalRequirements ?? 0,
      clickable: true,
    },
    {
      id: "published",
      icon: L.BadgeCheck,
      value: stats?.publishedRequirements ?? 0,
      clickable: true,
    },
    {
      id: "draft",
      icon: L.FileEdit,
      value: stats?.draftRequirements ?? 0,
      clickable: true,
    },
    {
      id: "covered",
      icon: L.Users,
      value: stats?.membersCovered ?? 0,
      clickable: false,
    },
  ];

  const isCardActive = (card: TRequirementStatCard) => {
    const cardStatus = statusForStatCard(card);
    if (!cardStatus) return status === "ALL";
    return status === (cardStatus as AssociationRequirementStatus);
  };

  return (
    <StatCardGrid>
      {cards.map((card) => (
        <StatCard
          key={card.id}
          icon={card.icon}
          value={card.value}
          isLoading={isLoading}
          title={t(`associationDashboard.requirements.stats.${card.id}`)}
          description={t(
            `associationDashboard.requirements.stats.${card.id}Hint`,
          )}
          isActive={
            card.clickable
              ? isCardActive(card.id as TRequirementStatCard)
              : undefined
          }
          onSelect={
            card.clickable
              ? () => applyStatCard(card.id as TRequirementStatCard)
              : undefined
          }
        />
      ))}
    </StatCardGrid>
  );
};
