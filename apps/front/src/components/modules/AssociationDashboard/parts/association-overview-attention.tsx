"use client";

import { TAssociationOverviewAttention } from "@/types/association-dashboard.types";
import { AssociationOverviewPanel } from "@modules/AssociationDashboard/parts/association-overview-panel";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import Link from "next/link";

import * as M from "@utils/association-messages";
import * as O from "@utils/association-overview";
import * as L from "lucide-react";

const SECTION_ICONS = {
  BELOW_THRESHOLD: L.TriangleAlert,
  NEW_JOINERS: L.UserPlus,
  CATEGORY_BEHIND: L.ChartColumnDecreasing,
  EXPIRING_CERTIFICATES: L.CalendarClock,
  READY_REPORTS: L.FileDown,
} as const;

export const AssociationOverviewAttention = ({
  hook,
}: TAssociationOverviewAttention) => {
  const { t, locale, attentionCounts, attentionTotal, attentionPanel } = hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.overview.${key}`, vars);

  return (
    <AssociationOverviewPanel
      isError={attentionPanel.isError}
      isLoading={attentionPanel.isLoading}
      retry={attentionPanel.retry}
      retryLabel={label("retry")}
      errorMessage={label("attention.error")}
      title={label("attention.title")}
      description={label("attention.description")}
      skeleton={
        <ul className="space-y-2">
          {M.ATTENTION_SECTIONS.map((section) => (
            <li key={section}>
              <Skeleton className="h-12 w-full rounded-md" />
            </li>
          ))}
        </ul>
      }
      action={
        <Button size="sm" radius="xl" variant="outline" asChild>
          <Link href={O.associationTabHref("messages")}>
            <L.ArrowUpRight className="h-4 w-4" />
            {label("attention.openTab")}
          </Link>
        </Button>
      }
    >
      {attentionTotal === 0 ? (
        <div className="flex items-center gap-2 rounded-md border p-4 text-sm text-muted-foreground">
          <L.CircleCheck className="h-4 w-4 text-primary" />
          {label("attention.settled")}
        </div>
      ) : (
        <ul className="space-y-2">
          {M.ATTENTION_SECTIONS.map((section) => {
            const count = O.attentionCountOf(attentionCounts, section);
            const Icon = SECTION_ICONS[section];

            return (
              <li key={section}>
                <Link
                  href={M.attentionSectionHref(section)}
                  className="flex items-center gap-3 rounded-md border p-3 transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="rounded-xl bg-primary/10 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>

                  <span className="min-w-0 flex-1 truncate text-sm">
                    {t(
                      `associationDashboard.messages.sections.${section}.title`,
                    )}
                  </span>

                  <Badge variant={count > 0 ? "secondary" : "outline"}>
                    {count.toLocaleString(locale)}
                  </Badge>

                  <L.ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </AssociationOverviewPanel>
  );
};
