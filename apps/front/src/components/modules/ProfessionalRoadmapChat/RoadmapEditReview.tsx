"use client";

import { RoadmapChangeOperationKind } from "@/lib/graphql/base";
import { buildBriefRows } from "@/utils/roadmap-brief-rows.util";
import { briefFieldOf } from "@/utils/roadmap-brief-rows.util";
import { briefRowText } from "@/utils/roadmap-brief-rows.util";
import { useI18n } from "@/hooks/useI18n";

import type * as T from "@/types/professional-roadmap-chat.types";

import * as L from "lucide-react";

const KEY = "professionalRoadmapChat.editReview";

export const RoadmapEditReview = ({ draft }: T.TRoadmapEditReviewProps) => {
  const { t, language } = useI18n();

  const rows = buildBriefRows(draft);
  const changed = new Set(draft.changedFields);
  const requests = draft.pendingChanges.filter(
    (change) =>
      change.operation !== RoadmapChangeOperationKind.UpdateDraft ||
      !change.targetField ||
      !changed.has(change.targetField),
  );
  const hasPreferenceChanges = draft.changedFields.length > 0;
  const hasRequests = requests.length > 0;

  const fieldLabel = (field: Parameters<typeof briefFieldOf>[0]) =>
    t(`professionalRoadmapChat.field.${briefFieldOf(field)}`);

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
          <ul className="mt-1 space-y-1">
            {draft.changedFields.map((field) => {
              const row = rows[briefFieldOf(field)];
              const value = row ? briefRowText(row, draft, t, language) : null;
              return (
                <li key={field} className="text-xs leading-5">
                  <span className="text-muted-foreground">
                    {fieldLabel(field)}:
                  </span>{" "}
                  <span className="font-medium text-foreground">
                    {value ?? t(`${KEY}.cleared`)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {hasRequests ? (
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t(`${KEY}.requests`)}
          </p>
          <ol className="mt-1 space-y-2">
            {requests.map((change, index) => {
              const isDraftChange =
                change.operation === RoadmapChangeOperationKind.UpdateDraft;
              const target =
                isDraftChange && change.targetField
                  ? fieldLabel(change.targetField)
                  : change.targetLabel;
              const showsInstruction = !isDraftChange || !change.targetField;
              return (
                <li
                  key={`${change.operation}-${change.targetId ?? "all"}-${index}`}
                  className="rounded-lg bg-muted/60 px-2.5 py-2 text-xs leading-5"
                >
                  <p className="font-medium">
                    {t(`${KEY}.operation.${change.operation}`)}
                    {target ? (
                      <span className="text-muted-foreground">
                        {" · "}
                        {target}
                      </span>
                    ) : null}
                  </p>
                  {showsInstruction ? (
                    <p className="text-muted-foreground">
                      {change.instruction}
                    </p>
                  ) : null}
                </li>
              );
            })}
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
