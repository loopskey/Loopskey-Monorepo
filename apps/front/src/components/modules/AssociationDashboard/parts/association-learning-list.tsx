"use client";

import { AssociationLearningContentStatus } from "@/lib/graphql/base";
import { TAssociationLearningContentRow } from "@/types/association-dashboard.types";
import { TAssociationLearningList } from "@/types/association-dashboard.types";
import { audienceSummaryLabel } from "@utils/association-learning-content";
import { humanizeEnumValue } from "@utils/function-helper";
import { DataTableFilters } from "@elements/data-table/data-table-filters";
import { PDU_CATEGORIES } from "@utils/pdu.constant";
import { DataTable } from "@elements/data-table/data-table";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import type { DataTableRowAction } from "@/types/data-table.types";

import * as L from "lucide-react";

const KEY = "associationDashboard.learningContent";
const ALL = "ALL";

const SOURCES = ["CATALOGUE", "EXTERNAL"] as const;

const STATUSES = [
  AssociationLearningContentStatus.Draft,
  AssociationLearningContentStatus.Published,
  AssociationLearningContentStatus.Withdrawn,
];

const STATUS_VARIANTS = {
  [AssociationLearningContentStatus.Draft]: "secondary",
  [AssociationLearningContentStatus.Published]: "default",
  [AssociationLearningContentStatus.Withdrawn]: "orange",
} as const;

export const AssociationLearningList = ({ hook }: TAssociationLearningList) => {
  const {
    t,
    page,
    items,
    locale,
    remove,
    search,
    status,
    source,
    category,
    openEdit,
    withdraw,
    nextPage,
    setSearch,
    setStatus,
    setSource,
    isMutating,
    isFiltered,
    openCreate,
    openAssign,
    totalCount,
    setCategory,
    setDetailId,
    openPublish,
    openMembers,
    hasNextPage,
    previousPage,
    isRefetching,
    resetFilters,
    requirementId,
    justPublishedId,
    setRequirementId,
    requirementOptions,
  } = hook;

  const label = (key: string) => t(`${KEY}.filters.${key}`);
  const column = (key: string) => t(`${KEY}.list.columns.${key}`);
  const date = (value: string) => new Date(value).toLocaleDateString(locale);
  const titleOf = (item: TAssociationLearningContentRow) =>
    item.title || t(`${KEY}.list.untitled`);

  const actionsFor = (
    item: TAssociationLearningContentRow,
  ): DataTableRowAction[] => {
    const isPublished =
      item.status === AssociationLearningContentStatus.Published;
    const isDraft = item.status === AssociationLearningContentStatus.Draft;

    const actions: DataTableRowAction[] = [
      {
        id: "view",
        icon: L.Eye,
        label: t(`${KEY}.actions.view`),
        onSelect: () => setDetailId(item.id),
      },
      {
        id: "edit",
        icon: L.PenLine,
        isDisabled: isMutating,
        label: t(`${KEY}.actions.edit`),
        onSelect: () => openEdit(item),
      },
      {
        id: "publish",
        isDisabled: isMutating,
        icon: isPublished ? L.Users : L.Send,
        onSelect: () => openPublish(item),
        label: t(`${KEY}.actions.${isPublished ? "reassign" : "publish"}`),
      },
    ];

    if (isPublished)
      actions.push(
        {
          id: "members",
          icon: L.UsersRound,
          label: t(`${KEY}.actions.viewMembers`),
          onSelect: () => openMembers(item),
        },
        {
          id: "withdraw",
          icon: L.Undo2,
          isDisabled: isMutating,
          label: t(`${KEY}.actions.withdraw`),
          onSelect: () => withdraw(item.id),
        },
      );

    if (isDraft)
      actions.push({
        id: "delete",
        tone: "danger",
        icon: L.Trash2,
        isPending: isMutating,
        label: t(`${KEY}.actions.delete`),
        onSelect: () => remove(item.id),
        confirm: {
          title: t(`${KEY}.confirm.deleteTitle`),
          description: t(`${KEY}.confirm.deleteBody`, { title: item.title }),
          confirmLabel: t(`${KEY}.confirm.deleteConfirm`),
          cancelLabel: t("associationDashboard.members.confirm.cancel"),
        },
      });

    return actions;
  };

  return (
    <DataTable
      rows={items}
      isFiltered={isFiltered}
      isFetching={isRefetching}
      rowActions={actionsFor}
      rowLabel={titleOf}
      rowKey={(item) => item.id}
      selectedRowKey={justPublishedId}
      caption={t(`${KEY}.list.caption`)}
      pagination={{
        kind: "cursor",
        page,
        hasNextPage,
        total: totalCount,
        onNext: nextPage,
        onPrevious: previousPage,
      }}
      empty={{
        icon: L.LibraryBig,
        title: t(`${KEY}.empty.firstRunTitle`),
        description: t(`${KEY}.empty.firstRunBody`),
        action: (
          <>
            <Button radius="lg" type="button" onClick={openCreate}>
              <L.Plus aria-hidden />
              {t(`${KEY}.actions.addContent`)}
            </Button>
            <Button
              radius="lg"
              type="button"
              variant="outline"
              onClick={openAssign}
            >
              <L.Users aria-hidden />
              {t(`${KEY}.actions.assignContent`)}
            </Button>
          </>
        ),
      }}
      filteredEmpty={{
        icon: L.SearchX,
        title: t(`${KEY}.empty.noResultsTitle`),
        description: t(`${KEY}.empty.noResultsBody`),
        action: (
          <Button
            radius="lg"
            type="button"
            variant="outline"
            onClick={resetFilters}
          >
            <L.FilterX aria-hidden />
            {label("clear")}
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
            label: label("search"),
            placeholder: label("searchPlaceholder"),
          }}
          filters={[
            {
              type: "select",
              id: "category",
              value: category,
              defaultValue: ALL,
              onChange: setCategory,
              label: label("category"),
              options: [
                { value: ALL, label: label("allCategories") },
                ...PDU_CATEGORIES.map((value) => ({
                  value,
                  label: humanizeEnumValue(value),
                })),
              ],
            },
            {
              type: "select",
              id: "status",
              value: status,
              defaultValue: ALL,
              onChange: setStatus,
              label: label("status"),
              options: [
                { value: ALL, label: label("allStatuses") },
                ...STATUSES.map((value) => ({
                  value,
                  label: t(`${KEY}.status.${value}`),
                })),
              ],
            },
            {
              type: "select",
              id: "source",
              value: source,
              defaultValue: ALL,
              onChange: setSource,
              label: label("source"),
              options: [
                { value: ALL, label: label("allSources") },
                ...SOURCES.map((value) => ({
                  value,
                  label: label(value === "EXTERNAL" ? "external" : "catalogue"),
                })),
              ],
            },
            {
              type: "select",
              id: "requirement",
              value: requirementId,
              defaultValue: ALL,
              onChange: setRequirementId,
              label: label("requirement"),
              options: [
                { value: ALL, label: label("allRequirements") },
                ...requirementOptions,
              ],
            },
          ]}
        />
      }
      columns={[
        {
          id: "title",
          mobile: "title",
          header: column("title"),
          className: "min-w-64 max-w-md whitespace-normal",
          cell: (item) => (
            <span className="block">
              <span className="block font-medium">{titleOf(item)}</span>
              {item.description ? (
                <span className="mt-0.5 line-clamp-2 block text-xs font-normal text-muted-foreground">
                  {item.description}
                </span>
              ) : null}
            </span>
          ),
        },
        {
          id: "status",
          mobile: "badge",
          header: column("status"),
          cell: (item) => (
            <span className="flex flex-wrap items-center gap-1.5">
              <Badge variant={STATUS_VARIANTS[item.status]}>
                {t(`${KEY}.status.${item.status}`)}
              </Badge>
              {!item.isAvailable && (
                <Badge variant="destructive">
                  {t(`${KEY}.list.unavailable`)}
                </Badge>
              )}
            </span>
          ),
        },
        {
          id: "source",
          header: column("source"),
          cell: (item) =>
            item.isExternal
              ? label("external")
              : humanizeEnumValue(item.contentType ?? ""),
        },
        {
          id: "provider",
          className: "max-w-48",
          header: column("provider"),
          cell: (item) => (
            <span className="block truncate">
              {item.provider ?? t(`${KEY}.list.noProvider`)}
            </span>
          ),
        },
        {
          id: "category",
          header: column("category"),
          cell: (item) =>
            item.category
              ? humanizeEnumValue(item.category)
              : t(`${KEY}.list.uncategorised`),
        },
        {
          id: "credits",
          align: "end",
          header: column("credits"),
          cell: (item) => item.indicativeCredits ?? "—",
        },
        {
          id: "audience",
          mobile: "wide",
          className: "max-w-64 whitespace-normal",
          header: column("audience"),
          cell: (item) => (
            <span className="block text-muted-foreground">
              {audienceSummaryLabel(item.audienceKind, item.targets, t)}
              {item.requirementName ? (
                <span className="block text-xs">
                  {t(`${KEY}.list.forRequirement`, {
                    requirement: item.requirementName,
                  })}
                </span>
              ) : null}
            </span>
          ),
        },
        {
          id: "added",
          mobile: "hidden",
          header: column("added"),
          cell: (item) => date(item.createdAt as string),
        },
      ]}
    />
  );
};
