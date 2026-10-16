"use client";

import { TAssociationOverviewCards } from "@/types/association-dashboard.types";
import { StatCardGrid } from "@elements/stat-card/stat-card-grid";
import { CHART_COLOR } from "@utils/chart.util";
import { StatCard } from "@elements/stat-card/stat-card";

import * as O from "@utils/association-overview";
import * as L from "lucide-react";

import type { StatCardSegment } from "@/types/stat-card.types";
import type { StatCardChip } from "@/types/stat-card.types";

const CARD_ICONS = {
  members: L.Users,
  requirements: L.ClipboardList,
  learningContent: L.GraduationCap,
} as const;

const REMAINDER_SEGMENT = {
  requirements: "archived",
  learningContent: "withdrawn",
} as const;

export const AssociationOverviewCards = ({
  hook,
}: TAssociationOverviewCards) => {
  const { t, counts, countsPanel } = hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.overview.${key}`, vars);

  const segment = (
    id: string,
    value: number,
    color: string,
  ): StatCardSegment => ({
    id,
    value,
    color,
    label: label(`cards.segments.${id}`),
  });

  const segmentsOf = (card: O.TOverviewCountCard): StatCardSegment[] => {
    if (card === "members") {
      const { active, pending } = counts.members;
      return [
        segment("active", active, CHART_COLOR.series1),
        segment("pending", pending, CHART_COLOR.warning),
      ];
    }

    const { total, published, draft } = counts[card];
    const rest = total - published - draft;

    return [
      segment("published", published, CHART_COLOR.series1),
      segment("draft", draft, CHART_COLOR.warning),
      ...(rest > 0
        ? [segment(REMAINDER_SEGMENT[card], rest, CHART_COLOR.neutral)]
        : []),
    ];
  };

  const chipOf = (card: O.TOverviewCountCard): StatCardChip | undefined => {
    if (card === "members") {
      const { total, pending } = counts.members;
      if (pending > 0)
        return {
          tone: "warning",
          label: label("cards.chips.pending", { count: pending }),
        };
      return total > 0
        ? { tone: "good", label: label("cards.chips.allActivated") }
        : undefined;
    }

    if (card === "requirements") {
      const { published, draft } = counts.requirements;
      return published === 0 && draft > 0
        ? { tone: "warning", label: label("cards.chips.notVisible") }
        : undefined;
    }

    return undefined;
  };

  return (
    <StatCardGrid
      columns={3}
      error={
        countsPanel.isError
          ? {
              message: label("cards.error"),
              retryLabel: label("retry"),
              onRetry: countsPanel.retry,
            }
          : null
      }
    >
      {O.OVERVIEW_COUNT_CARDS.map((card) => {
        const href = O.associationTabHref(O.COUNT_CARD_TABS[card]);

        return (
          <StatCard
            key={card}
            href={href}
            chip={chipOf(card)}
            icon={CARD_ICONS[card]}
            value={counts[card].total}
            segments={segmentsOf(card)}
            isLoading={countsPanel.isLoading}
            title={label(`cards.${card}.title`)}
            linkLabel={label(`cards.${card}.action`)}
            empty={
              counts[card].total === 0
                ? {
                    hint: label(`cards.${card}.hint`),
                    action: {
                      href,
                      label: label(`cards.${card}.emptyAction`),
                    },
                  }
                : undefined
            }
          />
        );
      })}
    </StatCardGrid>
  );
};
