"use client";

import { RoadmapDraftFieldKey } from "@/lib/graphql/base";
import { useI18n } from "@/hooks/useI18n";

import type * as T from "@/types/professional-roadmap-chat.types";

import * as L from "lucide-react";

const KEY = "professionalRoadmapChat.editReview";

const toFieldKey = (field: RoadmapDraftFieldKey) =>
  field
    .toLowerCase()
    .replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase());

export const RoadmapEditReview = ({ draft }: T.TRoadmapEditReviewProps) => {
  const { t } = useI18n();

  const hasPreferenceChanges = draft.changedFields.length > 0;
  const hasRequests = draft.pendingChanges.length > 0;

  return (
    <section
      aria-labelledby="roadmap-edit-review-heading"
      className="rounded-xl border bg-card p-3"
    >
      <h3
        id="roadmap-edit-review-heading"
        className="flex items-center gap-1.5 text-sm font-semibold"
      >
        <L.ListChecks aria-hidden className="size-4 text-primary" />
        {t(`${KEY}.title`)}
      </h3>

      {!hasPreferenceChanges && !hasRequests ? (
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {t(`${KEY}.empty`)}
        </p>
      ) : null}

      {hasPreferenceChanges ? (
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t(`${KEY}.preferences`)}
          </p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {draft.changedFields.map((field) => (
              <li
                key={field}
                className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
              >
                {t(`professionalRoadmapChat.field.${toFieldKey(field)}`)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasRequests ? (
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t(`${KEY}.requests`)}
          </p>
          <ol className="mt-1 space-y-2">
            {draft.pendingChanges.map((change, index) => (
              <li
                key={`${change.operation}-${change.targetId ?? "all"}-${index}`}
                className="rounded-lg bg-muted/60 px-2.5 py-2 text-xs leading-5"
              >
                <p className="font-medium">
                  {t(`${KEY}.operation.${change.operation}`)}
                  {change.targetLabel ? (
                    <span className="text-muted-foreground">
                      {" · "}
                      {change.targetLabel}
                    </span>
                  ) : null}
                </p>
                <p className="text-muted-foreground">{change.instruction}</p>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {draft.protectedStepCount > 0 ? (
        <p className="mt-3 flex items-start gap-1.5 text-xs leading-5 text-muted-foreground">
          <L.ShieldCheck
            aria-hidden
            className="mt-0.5 size-3.5 shrink-0 text-success"
          />
          {t(`${KEY}.protected`, { count: draft.protectedStepCount })}
        </p>
      ) : null}
    </section>
  );
};
