"use client";

import { TAssociationMemberActivitiesSection } from "@/types/association-dashboard.types";
import { TAssociationMemberActivityRow } from "@/types/association-dashboard.types";
import { AssociationAttributionState } from "@/lib/graphql/base";
import { humanizeEnumValue } from "@utils/function-helper";
import { DataTableFilters } from "@elements/data-table/data-table-filters";
import { DataTable } from "@elements/data-table/data-table";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

const ALL = "ALL";
const KEY = "associationDashboard.memberDetail.activities";

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
      ? t(`${KEY}.filterAll`)
      : t(`associationDashboard.memberDetail.state.${value}`);

  const activityMeta = (activity: TAssociationMemberActivityRow) => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={STATE_VARIANTS[activity.state]}>
        {t(`associationDashboard.memberDetail.state.${activity.state}`)}
      </Badge>

      {activity.isLate && <Badge variant="secondary">{t(`${KEY}.late`)}</Badge>}

      {!activity.hasEvidence && (
        <Badge variant="secondary">{t(`${KEY}.noEvidence`)}</Badge>
      )}
    </div>
  );

  const isFiltered = stateFilter !== ALL || requirementFilter !== ALL;

  return (
    <GlassCard>
      <div className="relative z-10 space-y-5">
        <div>
          <h2 className="text-xl font-medium">{t(`${KEY}.title`)}</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {t(`${KEY}.description`)}
          </p>

          {counts && (
            <p className="mt-2 text-xs text-muted-foreground">
              {t(`${KEY}.counts`, {
                counted: counts.counted,
                awaiting: counts.awaitingReview,
                rejected: counts.rejected,
              })}
            </p>
          )}
        </div>

        <DataTable
          rows={activities}
          inlineActionCount={3}
          isFiltered={isFiltered}
          caption={t(`${KEY}.title`)}
          rowKey={(activity) => activity.id}
          rowLabel={(activity) => activity.title}
          isLoading={hook.isActivitiesLoading}
          isFetching={hook.isActivitiesRefetching}
          pagination={{
            kind: "cursor",
            page: hook.page,
            onNext: nextPage,
            total: hook.totalCount,
            onPrevious: previousPage,
            hasNextPage: hook.hasNextPage,
          }}
          error={
            hook.isActivitiesError
              ? {
                  icon: L.TriangleAlert,
                  title: t(`${KEY}.errorTitle`),
                  action: (
                    <Button
                      radius="lg"
                      type="button"
                      variant="outline"
                      onClick={hook.retry}
                    >
                      <L.RotateCcw aria-hidden />
                      {t("associationDashboard.members.error.retry")}
                    </Button>
                  ),
                }
              : null
          }
          empty={{
            icon: L.NotebookPen,
            title: t(`${KEY}.emptyTitle`),
            description: t(`${KEY}.emptyBody`),
          }}
          filteredEmpty={{
            icon: L.SearchX,
            title: t(`${KEY}.emptyTitle`),
            description: t(`${KEY}.emptyFiltered`),
          }}
          toolbar={
            <DataTableFilters
              isFiltered={isFiltered}
              onReset={() => {
                changeStateFilter(ALL);
                changeRequirementFilter(ALL);
              }}
              filters={[
                {
                  type: "select",
                  id: "state",
                  value: stateFilter,
                  defaultValue: ALL,
                  onChange: changeStateFilter,
                  label: t(`${KEY}.filterLabel`),
                  options: STATE_FILTERS.map((value) => ({
                    value,
                    label: filterLabel(value),
                  })),
                },
                {
                  type: "select",
                  id: "requirement",
                  value: requirementFilter,
                  defaultValue: ALL,
                  onChange: changeRequirementFilter,
                  label: t(`${KEY}.requirementFilterLabel`),
                  options: [
                    { value: ALL, label: t(`${KEY}.filterAllRequirements`) },
                    ...requirementFilterOptions.map((option) => ({
                      value: option.id,
                      label: option.name,
                    })),
                  ],
                },
              ]}
            />
          }
          columns={[
            {
              id: "activity",
              mobile: "title",
              className: "min-w-64 max-w-md whitespace-normal",
              header: t(`${KEY}.columns.activity`),
              cell: (activity) => (
                <span className="block">
                  <span className="block font-medium">{activity.title}</span>

                  {activity.requirements.length > 0 && (
                    <span className="mt-1 block text-xs font-normal text-muted-foreground">
                      {t(`${KEY}.counting`, {
                        requirements: activity.requirements
                          .map((requirement) => requirement.name)
                          .join(", "),
                      })}
                    </span>
                  )}

                  {activity.reviewNote && (
                    <span className="mt-1 block text-xs font-normal text-muted-foreground">
                      {t(`${KEY}.reason`, { reason: activity.reviewNote })}
                    </span>
                  )}
                </span>
              ),
            },
            {
              id: "state",
              mobile: "wide",
              header: t(`${KEY}.filterLabel`),
              cell: activityMeta,
            },
            {
              id: "type",
              header: t(`${KEY}.columns.type`),
              cell: (activity) => humanizeEnumValue(activity.category),
            },
            {
              id: "completed",
              header: t(`${KEY}.columns.completed`),
              cell: (activity) => date(activity.date as string),
            },
          ]}
          rowActions={(activity) => [
            {
              id: "evidence",
              icon: L.FileSearch,
              label: t(`${KEY}.viewEvidence`),
              isDisabled: !activity.hasEvidence,
              onSelect: () => openEvidence(activity.id),
            },
            ...(activity.canReview
              ? [
                  {
                    id: "approve",
                    icon: L.Check,
                    isDisabled: isMutating,
                    label: t(`${KEY}.approve`),
                    onSelect: () => openDecision(activity.id, true),
                  },
                  {
                    id: "reject",
                    icon: L.X,
                    isDisabled: isMutating,
                    label: t(`${KEY}.reject`),
                    onSelect: () => openDecision(activity.id, false),
                  },
                ]
              : []),
          ]}
        />
      </div>
    </GlassCard>
  );
};
