"use client";

import { TAssociationMemberRequirementEvidencePanel } from "@/types/association-dashboard.types";
import { AssociationAttributionState } from "@/lib/graphql/base";
import { humanizeEnumValue } from "@utils/function-helper";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

const STATE_VARIANTS = {
  [AssociationAttributionState.Counted]: "default",
  [AssociationAttributionState.AwaitingReview]: "orange",
  [AssociationAttributionState.Rejected]: "secondary",
} as const;

const KEY = "associationDashboard.memberDetail.requirements.evidence";

export const AssociationMemberRequirementEvidence = ({
  hook,
  requirementId,
}: TAssociationMemberRequirementEvidencePanel) => {
  const {
    t,
    locale,
    isMutating,
    openEvidence,
    openDecision,
    requirementEvidence,
    isRequirementEvidenceLoading,
  } = hook;

  const date = (value: string) => new Date(value).toLocaleDateString(locale);

  if (isRequirementEvidenceLoading || requirementEvidence?.requirementId !== requirementId) {
    return (
      <div className="mt-6 space-y-3" aria-busy="true">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    );
  }

  const { activities, contentCompletions, certificateEvidence } =
    requirementEvidence;

  return (
    <div className="mt-6 space-y-6 border-t border-border pt-6">
      <div>
        <h4 className="text-sm font-medium">{t(`${KEY}.activitiesTitle`)}</h4>

        {activities.items.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {t(`${KEY}.emptyActivities`)}
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {activities.items.map((activity) => (
              <li
                key={activity.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {activity.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {humanizeEnumValue(activity.category)} ·{" "}
                    {date(activity.date as string)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={STATE_VARIANTS[activity.state]}>
                    {t(`associationDashboard.memberDetail.state.${activity.state}`)}
                  </Badge>

                  <Button
                    size="icon"
                    radius="xl"
                    type="button"
                    variant="outline"
                    disabled={!activity.hasEvidence}
                    onClick={() => openEvidence(activity.id)}
                    aria-label={t(
                      "associationDashboard.memberDetail.activities.viewEvidence",
                    )}
                  >
                    <L.FileSearch className="h-4 w-4" />
                  </Button>

                  {activity.canReview && (
                    <>
                      <Button
                        size="icon"
                        radius="xl"
                        type="button"
                        disabled={isMutating}
                        onClick={() => openDecision(activity.id, true)}
                        aria-label={t(
                          "associationDashboard.memberDetail.activities.approve",
                        )}
                      >
                        <L.Check className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        radius="xl"
                        type="button"
                        variant="destructive"
                        disabled={isMutating}
                        onClick={() => openDecision(activity.id, false)}
                        aria-label={t(
                          "associationDashboard.memberDetail.activities.reject",
                        )}
                      >
                        <L.X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h4 className="text-sm font-medium">{t(`${KEY}.contentTitle`)}</h4>

        {contentCompletions.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {t(`${KEY}.emptyContent`)}
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {contentCompletions.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[item.provider, date(item.activityDate as string)]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <Badge variant="secondary">
                  {t(`${KEY}.credits`, { credits: item.credits })}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h4 className="text-sm font-medium">{t(`${KEY}.certificateTitle`)}</h4>

        {certificateEvidence.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {t(`${KEY}.emptyCertificates`)}
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {certificateEvidence.map((activity) => (
              <li
                key={activity.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
              >
                <p className="truncate text-sm font-medium">
                  {activity.title}
                </p>
                <Button
                  size="sm"
                  radius="xl"
                  type="button"
                  variant="outline"
                  onClick={() => openEvidence(activity.id)}
                >
                  <L.FileSearch className="h-4 w-4" />
                  {t("associationDashboard.memberDetail.activities.viewEvidence")}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AssociationMemberRequirementEvidence;
