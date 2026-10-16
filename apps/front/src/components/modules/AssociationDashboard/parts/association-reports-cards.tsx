"use client";

import { AssociationComplianceBand } from "@/lib/graphql/base";
import { TAssociationReportsCards } from "@/types/association-dashboard.types";
import { StatCardGrid } from "@elements/stat-card/stat-card-grid";
import { StatCard } from "@elements/stat-card/stat-card";

import * as L from "lucide-react";

import type { TAssociationReportKey } from "@utils/association-reports";

type TCard = {
  id: string;
  count: number;
  change: number;
  share: number | null;
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
    <StatCardGrid columns={5}>
      {cards.map((card) => (
        <StatCard
          key={card.id}
          icon={card.icon}
          hasArrow
          isLoading={isLoading}
          value={card.count}
          title={label(`cards.${card.id}`)}
          notes={[changeLine(card.change)]}
          ariaLabel={label("cards.open", {
            report: label(`names.${card.report}`),
          })}
          description={
            card.share === null
              ? undefined
              : label("cards.share", {
                  share: card.share.toLocaleString(locale),
                })
          }
          onSelect={() =>
            openReport(card.report, card.band ? { band: card.band } : undefined)
          }
        />
      ))}
    </StatCardGrid>
  );
};
