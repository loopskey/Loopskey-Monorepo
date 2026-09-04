"use client";

import { AssociationLearningContentStatus } from "@/lib/graphql/base";
import { TAssociationLearningContentRow } from "@/types/association-dashboard.types";
import { TAssociationLearningList } from "@/types/association-dashboard.types";
import { humanizeEnumValue } from "@utils/function-helper";
import { ContentPagination } from "@elements/pagination";
import { ConfirmDialog } from "@elements/confirm-dialog";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as D from "@ui/dropdown-menu";
import * as L from "lucide-react";

const STATUS_VARIANTS = {
  [AssociationLearningContentStatus.Draft]: "secondary",
  [AssociationLearningContentStatus.Published]: "default",
  [AssociationLearningContentStatus.Withdrawn]: "orange",
} as const;

export const AssociationLearningList = ({ hook }: TAssociationLearningList) => {
  const {
    t,
    items,
    locale,
    remove,
    openEdit,
    withdraw,
    nextPage,
    isMutating,
    setDetailId,
    openPublish,
    isFiltered,
    openCreate,
    previousPage,
    isRefetching,
  } = hook;

  const date = (value: string) => new Date(value).toLocaleDateString(locale);

  const row = (item: TAssociationLearningContentRow) => (
    <li
      key={item.id}
      className="rounded-3xl border border-glass-border bg-background/50 p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => setDetailId(item.id)}
            className="text-left font-medium underline-offset-4 hover:underline"
          >
            {item.title ||
              t("associationDashboard.learningContent.list.untitled")}
          </button>

          <p className="mt-1 text-xs text-muted-foreground">
            {t("associationDashboard.learningContent.list.meta", {
              source: item.isExternal
                ? t("associationDashboard.learningContent.filters.external")
                : humanizeEnumValue(item.contentType ?? ""),
              provider:
                item.provider ??
                t("associationDashboard.learningContent.list.noProvider"),
              category: humanizeEnumValue(item.category),
              added: date(item.createdAt as string),
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={STATUS_VARIANTS[item.status]}>
            {t(`associationDashboard.learningContent.status.${item.status}`)}
          </Badge>

          {!item.isAvailable && (
            <Badge variant="destructive">
              {t("associationDashboard.learningContent.list.unavailable")}
            </Badge>
          )}

          <D.DropdownMenu>
            <D.DropdownMenuTrigger asChild>
              <Button
                size="sm"
                radius="xl"
                type="button"
                variant="glass"
                disabled={isMutating}
                aria-label={t(
                  "associationDashboard.learningContent.list.actionsFor",
                  { title: item.title },
                )}
              >
                <L.MoreHorizontal className="h-4 w-4" />
              </Button>
            </D.DropdownMenuTrigger>

            <D.DropdownMenuContent align="end" className="z-[9999] rounded-2xl">
              <D.DropdownMenuItem onSelect={() => setDetailId(item.id)}>
                <L.Eye className="h-4 w-4" />
                {t("associationDashboard.learningContent.actions.view")}
              </D.DropdownMenuItem>

              <D.DropdownMenuItem onSelect={() => openEdit(item)}>
                <L.PenLine className="h-4 w-4" />
                {t("associationDashboard.learningContent.actions.edit")}
              </D.DropdownMenuItem>

              {item.status !== AssociationLearningContentStatus.Published ? (
                <D.DropdownMenuItem onSelect={() => openPublish(item)}>
                  <L.Send className="h-4 w-4" />
                  {t("associationDashboard.learningContent.actions.publish")}
                </D.DropdownMenuItem>
              ) : (
                <D.DropdownMenuItem onSelect={() => void withdraw(item.id)}>
                  <L.Undo2 className="h-4 w-4" />
                  {t("associationDashboard.learningContent.actions.withdraw")}
                </D.DropdownMenuItem>
              )}

              {item.status === AssociationLearningContentStatus.Draft && (
                <ConfirmDialog
                  isLoading={isMutating}
                  confirmVariant="destructive"
                  title={t(
                    "associationDashboard.learningContent.confirm.deleteTitle",
                  )}
                  cancelText={t("associationDashboard.members.confirm.cancel")}
                  confirmText={t(
                    "associationDashboard.learningContent.confirm.deleteConfirm",
                  )}
                  description={t(
                    "associationDashboard.learningContent.confirm.deleteBody",
                    { title: item.title },
                  )}
                  onConfirm={() => remove(item.id)}
                  trigger={
                    <D.DropdownMenuItem
                      variant="destructive"
                      onSelect={(event) => event.preventDefault()}
                    >
                      <L.Trash2 className="h-4 w-4" />
                      {t("associationDashboard.learningContent.actions.delete")}
                    </D.DropdownMenuItem>
                  }
                />
              )}
            </D.DropdownMenuContent>
          </D.DropdownMenu>
        </div>
      </div>

      {item.description && (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
          {item.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {item.indicativeCredits !== null &&
          item.indicativeCredits !== undefined && (
            <span>
              {t("associationDashboard.learningContent.list.credits", {
                credits: item.indicativeCredits,
              })}
            </span>
          )}

        {item.requirementName && (
          <span>
            {t("associationDashboard.learningContent.list.forRequirement", {
              requirement: item.requirementName,
            })}
          </span>
        )}

        {item.groupTitle && (
          <span>
            {t("associationDashboard.learningContent.list.forGroup", {
              group: item.groupTitle,
            })}
          </span>
        )}
      </div>
    </li>
  );

  if (isRefetching)
    return (
      <div className="mt-6 space-y-3" aria-busy="true">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-3xl" />
        ))}
      </div>
    );

  if (items.length === 0)
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-glass-border p-10 text-center">
        <L.LibraryBig className="mx-auto h-8 w-8 text-muted-foreground" />

        <p className="mt-3 font-medium">
          {t(
            isFiltered
              ? "associationDashboard.learningContent.empty.noResultsTitle"
              : "associationDashboard.learningContent.empty.firstRunTitle",
          )}
        </p>

        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          {t(
            isFiltered
              ? "associationDashboard.learningContent.empty.noResultsBody"
              : "associationDashboard.learningContent.empty.firstRunBody",
          )}
        </p>

        {!isFiltered && (
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button
              radius="xl"
              type="button"
              variant="brand"
              onClick={() => openCreate(false)}
            >
              <L.LibraryBig className="h-4 w-4" />
              {t("associationDashboard.learningContent.actions.addCatalogue")}
            </Button>

            <Button
              radius="xl"
              type="button"
              variant="glass"
              onClick={() => openCreate(true)}
            >
              <L.Link className="h-4 w-4" />
              {t("associationDashboard.learningContent.actions.addExternal")}
            </Button>
          </div>
        )}
      </div>
    );

  return (
    <>
      <ul className="mt-6 space-y-3">{items.map(row)}</ul>

      <ContentPagination
        className="mt-6"
        page={hook.page}
        onNext={nextPage}
        isLoading={isRefetching}
        onPrevious={previousPage}
        totalCount={hook.totalCount}
        canPrevious={hook.canPrevious}
        hasNextPage={hook.hasNextPage}
      />
    </>
  );
};
