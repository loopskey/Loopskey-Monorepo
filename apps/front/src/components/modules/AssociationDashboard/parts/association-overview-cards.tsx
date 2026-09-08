"use client";

import { TAssociationOverviewCards } from "@/types/association-dashboard.types";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";

import Link from "next/link";

import * as O from "@utils/association-overview";
import * as L from "lucide-react";

const CARD_ICONS = {
  members: L.Users,
  requirements: L.ClipboardList,
  learningContent: L.GraduationCap,
} as const;

export const AssociationOverviewCards = ({
  hook,
}: TAssociationOverviewCards) => {
  const { t, locale, counts, countsPanel } = hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.overview.${key}`, vars);

  if (countsPanel.isError)
    return (
      <GlassCard glow={false}>
        <div className="relative z-10 flex flex-col items-start gap-3">
          <p role="alert" className="text-sm text-muted-foreground">
            <L.TriangleAlert className="mr-2 inline h-4 w-4 text-destructive" />
            {label("cards.error")}
          </p>

          <Button
            size="sm"
            radius="xl"
            variant="glass"
            onClick={countsPanel.retry}
          >
            <L.RotateCcw className="h-4 w-4" />
            {label("retry")}
          </Button>
        </div>
      </GlassCard>
    );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {O.OVERVIEW_COUNT_CARDS.map((card) => {
        const Icon = CARD_ICONS[card];

        return (
          <GlassCard key={card} glow={false} className="p-0 md:p-0">
            <Link
              href={O.associationTabHref(O.COUNT_CARD_TABS[card])}
              className="relative z-10 flex h-full flex-col gap-3 rounded-lg p-6 transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:p-5"
            >
              <span className="flex items-center gap-3">
                <span className="rounded-md bg-primary/10 p-2.5 text-primary">
                  <Icon className="h-5 w-5" />
                </span>

                <span className="text-sm text-muted-foreground">
                  {label(`cards.${card}.title`)}
                </span>
              </span>

              {countsPanel.isLoading ? (
                <Skeleton className="h-14 w-full rounded-md" />
              ) : (
                <span className="block">
                  <span className="block text-3xl font-medium tabular-nums">
                    {counts[card].toLocaleString(locale)}
                  </span>

                  <span className="mt-1 block text-xs text-muted-foreground">
                    {label(`cards.${card}.meaning`)}
                  </span>
                </span>
              )}

              <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm text-primary">
                {label(`cards.${card}.action`)}
                <L.ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </GlassCard>
        );
      })}
    </div>
  );
};
