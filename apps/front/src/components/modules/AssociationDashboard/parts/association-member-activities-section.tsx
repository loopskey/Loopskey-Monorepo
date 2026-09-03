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
    stateFilter,
    openEvidence,
    openDecision,
    isMutating,
    previousPage,
    changeStateFilter,
  } = hook;

  const date = (value: string) => new Date(value).toLocaleDateString(locale);

  const credits = (value: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);

  const filterLabel = (value: string) =>
    value === ALL
      ? t("associationDashboard.memberDetail.activities.filterAll")
      : t(`associationDashboard.memberDetail.state.${value}`);

  const row = (activity: TAssociationMemberActivityRow) => (
    <li
      key={activity.id}
      className="rounded-3xl border border-glass-border bg-background/50 p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{activity.title}</p>

          <p className="mt-1 text-xs text-muted-foreground">
            {t("associationDashboard.memberDetail.activities.meta", {
              source: humanizeEnumValue(activity.source),
              category: humanizeEnumValue(activity.category),
              credits: credits(activity.credits),
              date: date(activity.date as string),
            })}
          </p>
        </div>

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
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {t("associationDashboard.memberDetail.activities.counting", {
          requirements: activity.requirements
            .map((requirement) => requirement.name)
            .join(", "),
        })}
      </p>

      {activity.reviewNote && (
        <p className="mt-2 text-xs text-muted-foreground">
          {t("associationDashboard.memberDetail.activities.reason", {
            reason: activity.reviewNote,
          })}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          radius="xl"
          type="button"
          variant="glass"
          disabled={!activity.hasEvidence}
          onClick={() => openEvidence(activity.id)}
        >
          <L.FileSearch className="h-4 w-4" />
          {t("associationDashboard.memberDetail.activities.viewEvidence")}
        </Button>

        {activity.canReview && (
          <>
            <Button
              size="sm"
              radius="xl"
              type="button"
              variant="brand"
              disabled={isMutating}
              onClick={() => openDecision(activity.id, true)}
            >
              <L.Check className="h-4 w-4" />
              {t("associationDashboard.memberDetail.activities.approve")}
            </Button>

            <Button
              size="sm"
              radius="xl"
              type="button"
              variant="destructive"
              disabled={isMutating}
              onClick={() => openDecision(activity.id, false)}
            >
              <L.X className="h-4 w-4" />
              {t("associationDashboard.memberDetail.activities.reject")}
            </Button>
          </>
        )}
      </div>
    </li>
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
                className="mt-1 rounded-2xl"
              >
                <S.SelectValue />
              </S.SelectTrigger>

              <S.SelectContent className="z-[9999] rounded-2xl">
                {STATE_FILTERS.map((value) => (
                  <S.SelectItem key={value} value={value}>
                    {filterLabel(value)}
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
              <Skeleton key={index} className="h-32 w-full rounded-3xl" />
            ))}
          </div>
        ) : hook.isActivitiesError ? (
          <div className="mt-6 rounded-2xl border border-dashed border-destructive/40 p-8 text-center">
            <L.TriangleAlert className="mx-auto h-8 w-8 text-destructive" />

            <p className="mt-3 font-medium">
              {t("associationDashboard.memberDetail.activities.errorTitle")}
            </p>

            <Button
              radius="xl"
              type="button"
              variant="glass"
              className="mt-4"
              onClick={hook.retry}
            >
              <L.RotateCcw className="h-4 w-4" />
              {t("associationDashboard.members.error.retry")}
            </Button>
          </div>
        ) : activities.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-glass-border p-8 text-center">
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
            <ul className="mt-6 space-y-3">{activities.map(row)}</ul>

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
