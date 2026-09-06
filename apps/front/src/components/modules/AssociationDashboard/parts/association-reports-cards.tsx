"use client";

import { AssociationComplianceBand } from "@/lib/graphql/base";
import { TAssociationReportsCards } from "@/types/association-dashboard.types";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";

import * as L from "lucide-react";

import type { TAssociationReportKey } from "@utils/association-reports";

type TCard = {
  id: string;
  count: number;
  share: number | null;
  change: number;
  icon: typeof L.Users;
  report: TAssociationReportKey;
  band: AssociationComplianceBand | null;
};

export const AssociationReportsCards = ({ hook }: TAssociationReportsCards) => {
  const { t, locale, summary, openReport, isLoading } = hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.reports.${key}`, vars);

  const cards: TCard[] = [
    {
      id: "totalMembers",
      band: null,
      icon: L.Users,
      share: null,
      report: "member-progress",
      count: summary?.totalMembers ?? 0,
      change: summary?.totalMembersChange ?? 0,
    },
    {
      id: "renewalReady",
      icon: L.BadgeCheck,
      report: "renewal-readiness",
      band: AssociationComplianceBand.RenewalReady,
      count: summary?.renewalReady ?? 0,
      share: summary?.renewalReadyShare ?? 0,
      change: summary?.renewalReadyChange ?? 0,
    },
    {
      id: "onTrack",
      icon: L.TrendingUp,
      report: "member-progress",
      band: AssociationComplianceBand.OnTrack,
      count: summary?.onTrack ?? 0,
      share: summary?.onTrackShare ?? 0,
      change: summary?.onTrackChange ?? 0,
    },
    {
      id: "atRisk",
      icon: L.TriangleAlert,
      report: "member-progress",
      band: AssociationComplianceBand.AtRisk,
      count: summary?.atRisk ?? 0,
      share: summary?.atRiskShare ?? 0,
      change: summary?.atRiskChange ?? 0,
    },
    {
      id: "missingEvidence",
      band: null,
      icon: L.FileWarning,
      report: "missing-evidence",
      count: summary?.missingEvidence ?? 0,
      share: summary?.missingEvidenceShare ?? 0,
      change: summary?.missingEvidenceChange ?? 0,
    },
  ];

  const changeLine = (change: number) => {
    if (change === 0) return label("cards.flat");

    return label(change > 0 ? "cards.rise" : "cards.fall", {
      change: change.toLocaleString(locale),
    });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <GlassCard key={card.id} glow={false} className="p-0 md:p-0">
          <button
            type="button"
            className="relative z-10 flex h-full w-full flex-col gap-3 rounded-[2rem] p-6 text-left transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:p-5"
            aria-label={label("cards.open", {
              report: label(`names.${card.report}`),
            })}
            onClick={() =>
              openReport(
                card.report,
                card.band ? { band: card.band } : undefined,
              )
            }
          >
            <span className="flex items-center gap-3">
              <span className="rounded-2xl bg-primary/10 p-2.5 text-primary">
                <card.icon className="h-5 w-5" />
              </span>

              <span className="text-sm text-muted-foreground">
                {label(`cards.${card.id}`)}
              </span>
            </span>

            {isLoading ? (
              <Skeleton className="h-16 w-full rounded-2xl" />
            ) : (
              <span className="block">
                <span className="block text-2xl font-medium tabular-nums">
                  {card.count.toLocaleString(locale)}
                </span>

                {card.share !== null && (
                  <span className="block text-xs text-muted-foreground">
                    {label("cards.share", {
                      share: card.share.toLocaleString(locale),
                    })}
                  </span>
                )}

                <span className="mt-1 block text-xs text-muted-foreground">
                  {changeLine(card.change)}
                </span>
              </span>
            )}
          </button>
        </GlassCard>
      ))}
    </div>
  );
};
