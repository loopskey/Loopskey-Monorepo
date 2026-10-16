"use client";

import { TAssociationMemberCards } from "@/types/association-dashboard.types";
import { StatCardGrid } from "@elements/stat-card/stat-card-grid";
import { StatCard } from "@elements/stat-card/stat-card";

import * as L from "lucide-react";

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
    icon: typeof L.CircleCheck;
    title: string;
    value: string;
    note: string;
  }[] = [
    {
      id: "completed",
      icon: L.CircleCheck,
      title: t("associationDashboard.memberDetail.cards.completed"),
      value: credits(summary.creditsCompleted),
      note: t("associationDashboard.memberDetail.cards.completedNote", {
        required: credits(summary.creditsRequired),
      }),
    },
    {
      id: "remaining",
      icon: L.Hourglass,
      title: t("associationDashboard.memberDetail.cards.remaining"),
      value: credits(summary.creditsRemaining),
      note: t("associationDashboard.memberDetail.cards.remainingNote"),
    },
    {
      id: "deadline",
      icon: L.CalendarClock,
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
      icon: L.ClipboardCheck,
      title: t("associationDashboard.memberDetail.cards.awaiting"),
      value: String(summary.awaitingReviewCount),
      note: t("associationDashboard.memberDetail.cards.awaitingNote"),
    },
  ];

  return (
    <StatCardGrid>
      {cards.map((card) => (
        <StatCard
          key={card.id}
          icon={card.icon}
          title={card.title}
          value={card.value}
          description={card.note}
        />
      ))}
    </StatCardGrid>
  );
};
