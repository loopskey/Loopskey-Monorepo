"use client";

import { PduCompletionStatus } from "@/lib/graphql/base";
import { DataTableFilters } from "@elements/data-table/data-table-filters";
import { formatDate } from "@/utils/function-helper";
import { DataTable } from "@elements/data-table/data-table";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import type { ActivitiesTableProps } from "@/types/professional-tables.types";
import type { TPduActivity } from "@/types/professional-dashboard.types";

import * as L from "lucide-react";

const TRACKER = "professionalDashboard.cpdPduTracker";
const FILTERS = `${TRACKER}.filters`;
const ANY = "ALL";

export const ActivitiesTable = ({ hook }: ActivitiesTableProps) => {
  const {
    t,
    page,
    filters,
    pageInfo,
    isFiltered,
    activities,
    handleNext,
    currentYear,
    yearOptions,
    activitiesData,
    handlePrevious,
    isActivitiesError,
    refetchActivities,
    handleAddActivity,
    handleViewActivity,
    handleFilterChange,
    handleResetFilters,
    handleEditActivity,
    deletingActivityId,
    isActivitiesLoading,
    handleDeleteActivity,
    activityTypeOptions,
    isActivitiesFetching,
    handleDownloadEvidence,
  } = hook;

  const certificateCell = (activity: TPduActivity) => {
    const [firstFile] = activity.evidenceFiles;

    if (!firstFile)
      return (
        <span className="text-xs text-muted-foreground">
          {t(`${TRACKER}.table.noFile`)}
        </span>
      );

    return (
      <Button
        size="sm"
        radius="lg"
        type="button"
        variant="outline"
        className="h-8"
        title={firstFile.fileName}
        onClick={() => handleDownloadEvidence(firstFile)}
      >
        <L.Paperclip aria-hidden className="size-3.5" />
        {activity.evidenceFiles.length > 1
          ? `${t(`${TRACKER}.table.attached`)} (${activity.evidenceFiles.length})`
          : t(`${TRACKER}.table.attached`)}
      </Button>
    );
  };

  const resetButton = (
    <Button
      radius="lg"
      type="button"
      variant="outline"
      onClick={handleResetFilters}
    >
      <L.FilterX aria-hidden />
      {t(`${FILTERS}.clear`)}
    </Button>
  );

  return (
    <DataTable
      rows={activities}
      isFiltered={isFiltered}
      isLoading={isActivitiesLoading}
      isFetching={isActivitiesFetching}
      rowKey={(activity) => activity.id}
      rowLabel={(activity) => activity.title}
      caption={t(`${TRACKER}.activities.title`)}
      pagination={{
        kind: "cursor",
        page,
        onNext: handleNext,
        onPrevious: handlePrevious,
        total: activitiesData?.totalCount,
        hasNextPage: Boolean(pageInfo?.hasNextPage),
      }}
      error={
        isActivitiesError
          ? {
              icon: L.CircleAlert,
              title: t(`${TRACKER}.activities.errorTitle`),
              description: t(`${TRACKER}.activities.errorDescription`),
              action: (
                <Button
                  radius="lg"
                  type="button"
                  variant="outline"
                  onClick={() => void refetchActivities()}
                >
                  <L.RefreshCw aria-hidden />
                  {t("professionalDashboard.common.refresh")}
                </Button>
              ),
            }
          : null
      }
      empty={{
        icon: L.BookOpenCheck,
        title: t(`${TRACKER}.activities.emptyTitle`),
        description: t(`${TRACKER}.activities.emptyDescription`),
        action: (
          <Button radius="lg" type="button" onClick={handleAddActivity}>
            <L.FilePlus2 aria-hidden />
            {t(`${TRACKER}.quickActions.addActivity`)}
          </Button>
        ),
      }}
      filteredEmpty={{
        icon: L.SearchX,
        title: t(`${TRACKER}.activities.noMatchTitle`),
        description: t(`${TRACKER}.activities.noMatchDescription`),
        action: resetButton,
      }}
      toolbar={
        <DataTableFilters
          isFiltered={isFiltered}
          onReset={handleResetFilters}
          search={{
            value: filters.search,
            label: t(`${FILTERS}.search`),
            placeholder: t(`${FILTERS}.searchPlaceholder`),
            onChange: (value) => handleFilterChange("search", value),
          }}
          filters={[
            {
              type: "select",
              id: "year",
              label: t(`${FILTERS}.reportingYear`),
              value: String(filters.year),
              defaultValue: String(currentYear),
              options: yearOptions.map((year) => ({
                value: String(year),
                label: String(year),
              })),
              onChange: (value) => handleFilterChange("year", Number(value)),
            },
            {
              type: "select",
              id: "activityType",
              label: t(`${FILTERS}.activityType`),
              value: filters.activityType,
              defaultValue: ANY,
              options: [
                { value: ANY, label: t(`${FILTERS}.any`) },
                ...activityTypeOptions.map((option) => ({
                  value: option,
                  label: t(`${TRACKER}.activityTypes.${option}`),
                })),
              ],
              onChange: (value) =>
                handleFilterChange(
                  "activityType",
                  activityTypeOptions.find((option) => option === value) ?? ANY,
                ),
            },
            {
              type: "select",
              id: "certificate",
              label: t(`${FILTERS}.certificate`),
              value: filters.certificate,
              defaultValue: ANY,
              options: [
                { value: ANY, label: t(`${FILTERS}.any`) },
                { value: "WITH", label: t(`${FILTERS}.hasCertificate`) },
                { value: "WITHOUT", label: t(`${FILTERS}.noCertificate`) },
              ],
              onChange: (value) =>
                handleFilterChange(
                  "certificate",
                  value === "WITH" || value === "WITHOUT" ? value : ANY,
                ),
            },
          ]}
        />
      }
      columns={[
        {
          id: "title",
          mobile: "title",
          header: t(`${TRACKER}.table.title`),
          className: "max-w-72",
          cell: (activity) => (
            <span className="block truncate font-medium" title={activity.title}>
              {activity.title}
            </span>
          ),
        },
        {
          id: "status",
          mobile: "badge",
          header: t(`${TRACKER}.table.status`),
          cell: (activity) => (
            <Badge
              variant={
                activity.completionStatus === PduCompletionStatus.Completed
                  ? "default"
                  : "secondary"
              }
            >
              {t(`${TRACKER}.completionStatuses.${activity.completionStatus}`)}
            </Badge>
          ),
        },
        {
          id: "type",
          header: t(`${TRACKER}.table.type`),
          cell: (activity) => t(`${TRACKER}.activityTypes.${activity.source}`),
        },
        {
          id: "dateCompleted",
          header: t(`${TRACKER}.table.dateCompleted`),
          cell: (activity) => formatDate(activity.date),
        },
        {
          id: "creditValue",
          align: "end",
          header: t(`${TRACKER}.table.creditValue`),
          cell: (activity) => (
            <span className="font-medium">
              {Number(activity.pdus ?? 0).toFixed(1)}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                {t(`${TRACKER}.creditTypes.${activity.creditType}`)}
              </span>
            </span>
          ),
        },
        {
          id: "category",
          header: t(`${TRACKER}.table.category`),
          cell: (activity) => (
            <Badge variant="secondary">
              {t(`${TRACKER}.categories.${activity.category}`)}
            </Badge>
          ),
        },
        {
          id: "reportingYear",
          align: "end",
          header: t(`${TRACKER}.table.reportingYear`),
          cell: (activity) => activity.reportingYear ?? "—",
        },
        {
          id: "provider",
          mobile: "wide",
          className: "max-w-48",
          header: t(`${TRACKER}.table.provider`),
          cell: (activity) => (
            <span
              className="block truncate text-muted-foreground"
              title={activity.providerOrganizer ?? undefined}
            >
              {activity.providerOrganizer ?? "—"}
            </span>
          ),
        },
        {
          id: "certificate",
          mobile: "wide",
          header: t(`${TRACKER}.table.certificate`),
          cell: certificateCell,
        },
      ]}
      rowActions={(activity) => [
        {
          id: "view",
          icon: L.Eye,
          label: t(`${TRACKER}.actions.view`),
          onSelect: () => handleViewActivity(activity.id),
        },
        {
          id: "edit",
          icon: L.Pencil,
          label: t(`${TRACKER}.actions.edit`),
          onSelect: () => handleEditActivity(activity.id),
        },
        {
          id: "delete",
          tone: "danger",
          icon: L.Trash2,
          label: t(`${TRACKER}.actions.delete`),
          isDisabled: Boolean(deletingActivityId),
          isPending: deletingActivityId === activity.id,
          onSelect: () => handleDeleteActivity(activity.id),
          confirm: {
            title: t(`${TRACKER}.activities.deleteTitle`),
            description: t(`${TRACKER}.activities.deleteDescription`),
            confirmLabel: t("common.delete"),
            cancelLabel: t("common.cancel"),
          },
        },
      ]}
    />
  );
};
