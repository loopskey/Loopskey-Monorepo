"use client";

import { AssociationAttributionState } from "@/lib/graphql/base";
import { useI18n } from "@/hooks/useI18n";
import { Badge } from "@ui/badge";

import type { TContentCompletionStatusProps } from "@/types/professional-requirement.types";

const KEY = "cpdProgress.requirements.learning.status";

const STATE_CLASSES = {
  [AssociationAttributionState.Counted]:
    "border-transparent bg-success-soft text-success-soft-foreground",
  [AssociationAttributionState.AwaitingReview]:
    "border-transparent bg-warning-soft text-warning-soft-foreground",
  [AssociationAttributionState.Rejected]:
    "border-transparent bg-destructive-soft text-destructive-soft-foreground",
} as const;

const NEUTRAL_CLASSES =
  "border-transparent bg-secondary text-secondary-foreground";

const STATE_KEYS = {
  [AssociationAttributionState.Counted]: "counted",
  [AssociationAttributionState.AwaitingReview]: "awaitingReview",
  [AssociationAttributionState.Rejected]: "rejected",
} as const;

export const ContentCompletionStatus = ({
  content,
}: TContentCompletionStatusProps) => {
  const { t, language } = useI18n();

  if (!content.isCompleted) return null;

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(language === "fr" ? "fr-FR" : "en-GB");

  const state = content.completionState;
  const stateKey = state ? STATE_KEYS[state] : "completed";
  const detail = [
    content.completedAt
      ? t(`${KEY}.completedOn`, { date: formatDate(content.completedAt) })
      : null,
    content.submittedAt
      ? t(`${KEY}.submittedOn`, { date: formatDate(content.submittedAt) })
      : null,
    state === AssociationAttributionState.Counted && content.creditedAmount
      ? t(`${KEY}.credited`, { credits: content.creditedAmount })
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge
          className={`px-1.5 py-0 text-[10px] ${state ? STATE_CLASSES[state] : NEUTRAL_CLASSES}`}
        >
          {t(`${KEY}.${stateKey}`)}
        </Badge>
        {content.isLate ? (
          <Badge className="border-transparent bg-warning-soft px-1.5 py-0 text-[10px] text-warning-soft-foreground">
            {t(`${KEY}.late`)}
          </Badge>
        ) : null}
      </div>
      {detail ? (
        <p className="truncate text-xs text-muted-foreground" title={detail}>
          {detail}
        </p>
      ) : null}
    </>
  );
};
