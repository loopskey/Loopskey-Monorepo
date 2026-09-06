"use client";

import { TAssociationMemberCards } from "@/types/association-dashboard.types";
import { GlassCard } from "@elements/glass-card";

import * as L from "lucide-react";

import type { ReactNode } from "react";

export const AssociationMemberDetailCards = ({
  hook,
}: TAssociationMemberCards) => {
  const { t, summary, locale } = hook;

  if (!summary) return null;

  const credits = (value: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);

  const deadline = summary.nearestDueDate
    ? new Date(summary.nearestDueDate as string).toLocaleDateString(locale)
    : null;

  const cards: {
    id: string;
    icon: ReactNode;
    title: string;
    value: string;
    note: string;
  }[] = [
    {
      id: "completed",
      icon: <L.CircleCheck className="h-5 w-5" />,
      title: t("associationDashboard.memberDetail.cards.completed"),
      value: credits(summary.creditsCompleted),
      note: t("associationDashboard.memberDetail.cards.completedNote", {
        required: credits(summary.creditsRequired),
      }),
    },
    {
      id: "remaining",
      icon: <L.Hourglass className="h-5 w-5" />,
      title: t("associationDashboard.memberDetail.cards.remaining"),
      value: credits(summary.creditsRemaining),
      note: t("associationDashboard.memberDetail.cards.remainingNote"),
    },
    {
      id: "deadline",
      icon: <L.CalendarClock className="h-5 w-5" />,
      title: t("associationDashboard.memberDetail.cards.deadline"),
      value:
        summary.nearestDueDays === null || summary.nearestDueDays === undefined
          ? t("associationDashboard.memberDetail.cards.noDeadline")
          : t("associationDashboard.memberDetail.cards.days", {
              days: summary.nearestDueDays,
            }),
      note: summary.nearestRequirementName
        ? t("associationDashboard.memberDetail.cards.deadlineNote", {
            requirement: summary.nearestRequirementName,
            date: deadline ?? "-",
          })
        : t("associationDashboard.memberDetail.cards.noDeadlineNote"),
    },
    {
      id: "awaiting",
      icon: <L.ClipboardCheck className="h-5 w-5" />,
      title: t("associationDashboard.memberDetail.cards.awaiting"),
      value: String(summary.awaitingReviewCount),
      note: t("associationDashboard.memberDetail.cards.awaitingNote"),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <GlassCard key={card.id} glow={false}>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-muted-foreground">
              {card.icon}
              <p className="text-xs uppercase">{card.title}</p>
            </div>

            <p className="mt-3 text-2xl font-semibold">{card.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.note}</p>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};
