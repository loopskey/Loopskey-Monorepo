"use client";

import { TAssociationMemberActivitiesSection } from "@/types/association-dashboard.types";
import { TAssociationMemberActivityRow } from "@/types/association-dashboard.types";
import { AssociationAttributionState } from "@/lib/graphql/base";
import { humanizeEnumValue } from "@utils/function-helper";
import { ContentPagination } from "@elements/pagination";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as S from "@ui/select";
import * as L from "lucide-react";

const ALL = "ALL";

const STATE_FILTERS = [
  ALL,
  AssociationAttributionState.Counted,
  AssociationAttributionState.AwaitingReview,
  AssociationAttributionState.Rejected,
] as const;

const STATE_VARIANTS = {
  [AssociationAttributionState.Counted]: "default",
  [AssociationAttributionState.AwaitingReview]: "orange",
  [AssociationAttributionState.Rejected]: "secondary",
} as const;

export const AssociationMemberActivitiesSection = ({
  hook,
}: TAssociationMemberActivitiesSection) => {
  const {
    t,
    locale,
    counts,
    nextPage,
    activities,
    isMutating,
    stateFilter,
    openEvidence,
    openDecision,
    previousPage,
    changeStateFilter,
    requirementFilter,
    changeRequirementFilter,
    requirementFilterOptions,
  } = hook;

  const date = (value: string) => new Date(value).toLocaleDateString(locale);

  const filterLabel = (value: string) =>
    value === ALL
      ? t("associationDashboard.memberDetail.activities.filterAll")
      : t(`associationDashboard.memberDetail.state.${value}`);

  const activityMeta = (activity: TAssociationMemberActivityRow) => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={STATE_VARIANTS[activity.state]}>
        {t(`associationDashboard.memberDetail.state.${activity.state}`)}
      </Badge>

      {activity.isLate && (
        <Badge variant="secondary">
          {t("associationDashboard.memberDetail.activities.late")}
        </Badge>
      )}

      {!activity.hasEvidence && (
        <Badge variant="secondary">
          {t("associationDashboard.memberDetail.activities.noEvidence")}
        </Badge>
      )}
    </div>
  );

  const rowActions = (activity: TAssociationMemberActivityRow) => (
    <div className="flex flex-wrap items-center justify-end gap-2">
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
  );

  return (
    <GlassCard>
      <div className="relative z-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-medium">
              {t("associationDashboard.memberDetail.activities.title")}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("associationDashboard.memberDetail.activities.description")}
            </p>
          </div>

          <div className="w-full sm:w-64">
            <label
              htmlFor="association-activity-state"
              className="text-xs uppercase text-muted-foreground"
            >
              {t("associationDashboard.memberDetail.activities.filterLabel")}
            </label>

            <S.Select value={stateFilter} onValueChange={changeStateFilter}>
              <S.SelectTrigger
                id="association-activity-state"
                className="mt-1 rounded-md"
              >
                <S.SelectValue />
              </S.SelectTrigger>

              <S.SelectContent className="z-[9999] rounded-md">
                {STATE_FILTERS.map((value) => (
                  <S.SelectItem key={value} value={value}>
                    {filterLabel(value)}
                  </S.SelectItem>
                ))}
              </S.SelectContent>
            </S.Select>
          </div>

          <div className="w-full sm:w-64">
            <label
              htmlFor="association-activity-requirement"
              className="text-xs uppercase text-muted-foreground"
            >
              {t(
                "associationDashboard.memberDetail.activities.requirementFilterLabel",
              )}
            </label>

            <S.Select
              value={requirementFilter}
              onValueChange={changeRequirementFilter}
            >
              <S.SelectTrigger
                id="association-activity-requirement"
                className="mt-1 rounded-md"
              >
                <S.SelectValue />
              </S.SelectTrigger>

              <S.SelectContent className="z-[9999] rounded-md">
                <S.SelectItem value={ALL}>
                  {t(
                    "associationDashboard.memberDetail.activities.filterAllRequirements",
                  )}
                </S.SelectItem>
                {requirementFilterOptions.map((option) => (
                  <S.SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </S.SelectItem>
                ))}
              </S.SelectContent>
            </S.Select>
          </div>
        </div>

        {counts && (
          <p className="mt-4 text-xs text-muted-foreground">
            {t("associationDashboard.memberDetail.activities.counts", {
              counted: counts.counted,
              awaiting: counts.awaitingReview,
              rejected: counts.rejected,
            })}
          </p>
        )}

        {hook.isActivitiesLoading || hook.isActivitiesRefetching ? (
          <div className="mt-6 space-y-3" aria-busy="true">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-md" />
            ))}
          </div>
        ) : hook.isActivitiesError ? (
          <div className="mt-6 rounded-md border border-dashed border-destructive/40 p-8 text-center">
            <L.TriangleAlert className="mx-auto h-8 w-8 text-destructive" />

            <p className="mt-3 font-medium">
              {t("associationDashboard.memberDetail.activities.errorTitle")}
            </p>

            <Button
              radius="xl"
              type="button"
              variant="outline"
              className="mt-4"
              onClick={hook.retry}
            >
              <L.RotateCcw className="h-4 w-4" />
              {t("associationDashboard.members.error.retry")}
            </Button>
          </div>
        ) : activities.length === 0 ? (
          <div className="mt-6 rounded-md border border-dashed border-border p-8 text-center">
            <L.NotebookPen className="mx-auto h-8 w-8 text-muted-foreground" />

            <p className="mt-3 font-medium">
              {t("associationDashboard.memberDetail.activities.emptyTitle")}
            </p>

            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              {t(
                stateFilter === ALL
                  ? "associationDashboard.memberDetail.activities.emptyBody"
                  : "associationDashboard.memberDetail.activities.emptyFiltered",
              )}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left text-sm">
                <caption className="sr-only">
                  {t("associationDashboard.memberDetail.activities.title")}
                </caption>

                <thead className="text-xs uppercase text-muted-foreground">
                  <tr className="border-b border-border">
                    <th scope="col" className="py-3">
                      {t(
                        "associationDashboard.memberDetail.activities.columns.activity",
                      )}
                    </th>
                    <th scope="col" className="py-3">
                      {t(
                        "associationDashboard.memberDetail.activities.columns.type",
                      )}
                    </th>
                    <th scope="col" className="py-3">
                      {t(
                        "associationDashboard.memberDetail.activities.columns.completed",
                      )}
                    </th>
                    <th scope="col" className="py-3 text-right">
                      {t(
                        "associationDashboard.memberDetail.activities.columns.actions",
                      )}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {activities.map((activity) => (
                    <tr
                      key={activity.id}
                      className="border-b border-border/70 align-top"
                    >
                      <td className="py-4 pr-4">
                        <p className="font-medium">{activity.title}</p>
                        <div className="mt-1">{activityMeta(activity)}</div>

                        {activity.requirements.length > 0 && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            {t(
                              "associationDashboard.memberDetail.activities.counting",
                              {
                                requirements: activity.requirements
                                  .map((requirement) => requirement.name)
                                  .join(", "),
                              },
                            )}
                          </p>
                        )}

                        {activity.reviewNote && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {t(
                              "associationDashboard.memberDetail.activities.reason",
                              { reason: activity.reviewNote },
                            )}
                          </p>
                        )}
                      </td>

                      <td className="py-4 pr-4">
                        {humanizeEnumValue(activity.category)}
                      </td>

                      <td className="py-4 pr-4">
                        {date(activity.date as string)}
                      </td>

                      <td className="py-4 text-right">
                        {rowActions(activity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="mt-6 space-y-3 md:hidden">
              {activities.map((activity) => (
                <li key={activity.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{activity.title}</p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {humanizeEnumValue(activity.category)} ·{" "}
                        {date(activity.date as string)}
                      </p>
                    </div>

                    {activityMeta(activity)}
                  </div>

                  {activity.requirements.length > 0 && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      {t(
                        "associationDashboard.memberDetail.activities.counting",
                        {
                          requirements: activity.requirements
                            .map((requirement) => requirement.name)
                            .join(", "),
                        },
                      )}
                    </p>
                  )}

                  {activity.reviewNote && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t(
                        "associationDashboard.memberDetail.activities.reason",
                        {
                          reason: activity.reviewNote,
                        },
                      )}
                    </p>
                  )}

                  <div className="mt-4">{rowActions(activity)}</div>
                </li>
              ))}
            </ul>

            <ContentPagination
              className="mt-6"
              page={hook.page}
              onNext={nextPage}
              totalCount={hook.totalCount}
              onPrevious={previousPage}
              canPrevious={hook.canPrevious}
              hasNextPage={hook.hasNextPage}
              isLoading={hook.isActivitiesRefetching}
            />
          </>
        )}
      </div>
    </GlassCard>
  );
};
