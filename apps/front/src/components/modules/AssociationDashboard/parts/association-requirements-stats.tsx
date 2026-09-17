"use client";

import { TAssociationRequirementsStats } from "@/types/association-dashboard.types";
import { AssociationRequirementStatus } from "@/lib/graphql/base";
import { TRequirementStatCard } from "@utils/association-requirement";
import { statusForStatCard } from "@utils/association-requirement";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";

import * as L from "lucide-react";

export const AssociationRequirementsStats = ({
  hook,
}: TAssociationRequirementsStats) => {
  const { t, stats, status, locale, isLoading, applyStatCard } = hook;

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
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const body = (
          <>
            <span className="rounded-md bg-primary/10 p-3 text-primary">
              <card.icon className="h-5 w-5" />
            </span>

            <span>
              <span className="block text-sm text-muted-foreground">
                {t(`associationDashboard.requirements.stats.${card.id}`)}
              </span>

              {isLoading ? (
                <Skeleton className="mt-2 h-7 w-16" />
              ) : (
                <span className="block text-2xl font-medium tabular-nums">
                  {card.value.toLocaleString(locale)}
                </span>
              )}

              <span className="mt-1 block text-xs text-muted-foreground">
                {t(`associationDashboard.requirements.stats.${card.id}Hint`)}
              </span>
            </span>
          </>
        );

        return (
          <GlassCard key={card.id} glow={false} className="p-0">
            {card.clickable ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => applyStatCard(card.id as TRequirementStatCard)}
                aria-pressed={isCardActive(card.id as TRequirementStatCard)}
                className="relative z-10 h-auto w-full justify-start gap-4 rounded-lg p-6 text-left"
              >
                {body}
              </Button>
            ) : (
              <div className="relative z-10 flex w-full items-start gap-4 rounded-lg p-6 text-left">
                {body}
              </div>
            )}
          </GlassCard>
        );
      })}
    </div>
  );
};
