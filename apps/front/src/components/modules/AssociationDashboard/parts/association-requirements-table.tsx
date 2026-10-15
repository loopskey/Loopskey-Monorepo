"use client";

import { TAssociationRequirementsTable } from "@/types/association-dashboard.types";
import { AssociationRequirementStatus } from "@/lib/graphql/base";
import { TAssociationRequirementRow } from "@/types/association-dashboard.types";
import { DataTableFilters } from "@elements/data-table/data-table-filters";
import { DataTable } from "@elements/data-table/data-table";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import type { DataTableRowAction } from "@/types/data-table.types";

import * as L from "lucide-react";

const REQUIREMENTS = "associationDashboard.requirements";
const ALL = "ALL";

const STATUSES = [
  AssociationRequirementStatus.Draft,
  AssociationRequirementStatus.Published,
  AssociationRequirementStatus.Archived,
];

const statusVariant = (status: AssociationRequirementStatus) => {
  if (status === AssociationRequirementStatus.Published)
    return "default" as const;
  if (status === AssociationRequirementStatus.Draft) return "orange" as const;
  return "secondary" as const;
};

export const AssociationRequirementsTable = ({
  hook,
}: TAssociationRequirementsTable) => {
  const {
    t,
    page,
    goTo,
    search,
    status,
    locale,
    nextPage,
    isSaving,
    setSearch,
    setStatus,
    isFiltered,
    totalCount,
    hasNextPage,
    startWizard,
    isRefetching,
    previousPage,
    requirements,
    resetFilters,
    hasNoRequirements,
    deleteRequirement,
    archiveRequirement,
  } = hook;

  const formatDate = (value: string | null | undefined) =>
    value ? new Date(value).toLocaleDateString(locale) : "-";

  const audienceLabel = (requirement: TAssociationRequirementRow) => {
    const named = requirement.targets
      .map((target) => target.label)
      .filter(Boolean);

    if (named.length) return named.join(", ");
    return t(`${REQUIREMENTS}.audience.${requirement.audienceKind}`);
  };

  const confirmFor = (kind: "delete" | "archive", name: string) => ({
    title: t(`${REQUIREMENTS}.confirm.${kind}Title`),
    description: t(`${REQUIREMENTS}.confirm.${kind}Body`, { name }),
    confirmLabel: t(`${REQUIREMENTS}.confirm.${kind}Confirm`),
    cancelLabel: t(`${REQUIREMENTS}.confirm.cancel`),
  });

  const actionsFor = (
    requirement: TAssociationRequirementRow,
  ): DataTableRowAction[] => {
    const isDraft = requirement.status === AssociationRequirementStatus.Draft;
    const isPublished =
      requirement.status === AssociationRequirementStatus.Published;

    const actions: DataTableRowAction[] = [
      {
        id: "view",
        icon: L.Eye,
        isDisabled: isSaving,
        label: t("common.view"),
        onSelect: () => goTo(requirement.id),
      },
      {
        id: "edit",
        icon: L.PencilLine,
        isDisabled: isSaving,
        label: t("common.edit"),
        onSelect: () => goTo(requirement.id, isDraft ? "details" : undefined),
      },
    ];

    if (isDraft)
      actions.push({
        id: "delete",
        tone: "danger",
        icon: L.Trash2,
        isPending: isSaving,
        label: t("common.delete"),
        confirm: confirmFor("delete", requirement.name),
        onSelect: () => deleteRequirement(requirement.id),
      });

    if (isPublished)
      actions.push({
        id: "archive",
        tone: "danger",
        icon: L.Archive,
        isPending: isSaving,
        label: t(`${REQUIREMENTS}.confirm.archiveConfirm`),
        confirm: confirmFor("archive", requirement.name),
        onSelect: () => archiveRequirement(requirement.id),
      });

    return actions;
  };

  return (
    <DataTable
      isFetching={isRefetching}
      rowKey={(requirement) => requirement.id}
      rows={hasNoRequirements ? [] : requirements}
      rowLabel={(requirement) => requirement.name}
      caption={t(`${REQUIREMENTS}.table.caption`)}
      isFiltered={isFiltered && !hasNoRequirements}
      rowActions={actionsFor}
      pagination={{
        kind: "cursor",
        page,
        hasNextPage,
        total: totalCount,
        onNext: nextPage,
        onPrevious: previousPage,
      }}
      empty={{
        icon: L.ListChecks,
        title: t(`${REQUIREMENTS}.empty.firstRunTitle`),
        description: t(`${REQUIREMENTS}.empty.firstRunBody`),
        action: (
          <Button radius="lg" type="button" onClick={startWizard}>
            <L.Plus aria-hidden />
            {t(`${REQUIREMENTS}.empty.createFirst`)}
          </Button>
        ),
      }}
      filteredEmpty={{
        icon: L.SearchX,
        title: t(`${REQUIREMENTS}.empty.noResultsTitle`),
        description: t(`${REQUIREMENTS}.empty.noResultsBody`),
        action: (
          <Button
            radius="lg"
            type="button"
            variant="outline"
            onClick={resetFilters}
          >
            <L.FilterX aria-hidden />
            {t(`${REQUIREMENTS}.filters.clear`)}
          </Button>
        ),
      }}
      toolbar={
        <DataTableFilters
          isFiltered={isFiltered}
          onReset={resetFilters}
          search={{
            value: search,
            onChange: setSearch,
            label: t(`${REQUIREMENTS}.filters.search`),
            placeholder: t(`${REQUIREMENTS}.filters.searchPlaceholder`),
          }}
          filters={[
            {
              type: "select",
              id: "status",
              value: status,
              defaultValue: ALL,
              onChange: setStatus,
              label: t(`${REQUIREMENTS}.filters.status`),
              options: [
                { value: ALL, label: t(`${REQUIREMENTS}.filters.allStatuses`) },
                ...STATUSES.map((value) => ({
                  value,
                  label: t(`${REQUIREMENTS}.status.${value}`),
                })),
              ],
            },
          ]}
        />
      }
      columns={[
        {
          id: "name",
          mobile: "title",
          className: "max-w-80 whitespace-normal",
          header: t(`${REQUIREMENTS}.table.name`),
          cell: (requirement) => (
            <span className="block">
              <span className="block font-medium">{requirement.name}</span>
              <span className="block text-xs font-normal text-muted-foreground">
                {`${requirement.totalRequiredCredits.toLocaleString(locale)} ${requirement.creditType}`}{" "}
                · {audienceLabel(requirement)}
              </span>
            </span>
          ),
        },
        {
          id: "status",
          mobile: "badge",
          header: t(`${REQUIREMENTS}.table.status`),
          cell: (requirement) => (
            <Badge variant={statusVariant(requirement.status)}>
              {t(`${REQUIREMENTS}.status.${requirement.status}`)}
            </Badge>
          ),
        },
        {
          id: "cycle",
          header: t(`${REQUIREMENTS}.table.cycle`),
          cell: (requirement) =>
            t(`${REQUIREMENTS}.cycle.${requirement.reportingCycle}`),
        },
        {
          id: "covered",
          align: "end",
          header: t(`${REQUIREMENTS}.table.covered`),
          cell: (requirement) =>
            requirement.assignedMemberCount.toLocaleString(locale),
        },
        {
          id: "deadline",
          header: t(`${REQUIREMENTS}.table.deadline`),
          cell: (requirement) => formatDate(requirement.deadline),
        },
      ]}
    />
  );
};
