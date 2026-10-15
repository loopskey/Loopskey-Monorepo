"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { CircleAlert, RefreshCw } from "lucide-react";
import { mobileSlotOf, nextSort } from "@/utils/data-table.util";
import { DataTableRowActions } from "./data-table-row-actions";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableStatePanel } from "./data-table-state";
import { DataTableSortSheet } from "./data-table-sort-sheet";
import { useRef, useState } from "react";
import { ConfirmDialog } from "@elements/confirm-dialog";
import { Checkbox } from "@ui/checkbox";
import { Skeleton } from "@ui/skeleton";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import type { KeyboardEvent, MouseEvent } from "react";

import type * as T from "@/types/data-table.types";

type PendingConfirm = {
  rowKey: string;
  actionId: string;
  isDanger: boolean;
  confirm: T.DataTableConfirm;
};

const DEFAULT_SKELETON_ROWS = 5;
const DEFAULT_INLINE_ACTIONS = 2;
const INTERACTIVE_SELECTOR =
  "a, button, input, select, textarea, label, [role='menuitem']";

const isFromInteractive = (event: MouseEvent | KeyboardEvent) =>
  event.target instanceof Element &&
  event.target !== event.currentTarget &&
  Boolean(event.target.closest(INTERACTIVE_SELECTOR));

export const DataTable = <Row,>({
  rows,
  sort,
  empty,
  error,
  rowKey,
  isError,
  onRetry,
  columns,
  caption,
  toolbar,
  rowLabel,
  className,
  isLoading,
  rowActions,
  selection,
  isFetching,
  isFiltered,
  onRowClick,
  pagination,
  onSortChange,
  filteredEmpty,
  selectedRowKey,
  scrollClassName,
  skeletonRows = DEFAULT_SKELETON_ROWS,
  inlineActionCount = DEFAULT_INLINE_ACTIONS,
}: T.DataTableProps<Row>) => {
  const { t } = useI18n();
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const slotted = columns.map((column, index) => ({
    column,
    slot: mobileSlotOf(column, index, columns),
  }));
  const titleColumns = slotted.filter((entry) => entry.slot === "title");
  const badgeColumns = slotted.filter((entry) => entry.slot === "badge");
  const metaColumns = slotted.filter(
    (entry) => entry.slot === "meta" || entry.slot === "wide",
  );
  const sortableColumns = columns.filter((column) => column.isSortable);
  const canSort = Boolean(onSortChange) && sortableColumns.length > 0;

  const pendingRow = pending
    ? rows.find((row) => rowKey(row) === pending.rowKey)
    : undefined;
  const pendingAction =
    pending && pendingRow
      ? rowActions?.(pendingRow).find(
          (action) => action.id === pending.actionId,
        )
      : undefined;

  const requestConfirm =
    (row: Row) =>
    (action: T.DataTableRowAction, origin: HTMLElement | null) => {
      if (!action.confirm) return;
      returnFocusRef.current = origin;
      setPending({
        rowKey: rowKey(row),
        actionId: action.id,
        confirm: action.confirm,
        isDanger: action.tone === "danger",
      });
      setIsConfirmOpen(true);
    };

  const confirmPending = async () => {
    if (!pendingAction) {
      setIsConfirmOpen(false);
      return;
    }
    setIsConfirming(true);
    try {
      await pendingAction.onSelect?.();
    } finally {
      setIsConfirming(false);
      setIsConfirmOpen(false);
    }
  };

  const activate = (row: Row) => (event: MouseEvent) => {
    if (!onRowClick || isFromInteractive(event)) return;
    onRowClick(row);
  };

  const activateByKey = (row: Row) => (event: KeyboardEvent) => {
    if (!onRowClick || event.target !== event.currentTarget) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onRowClick(row);
  };

  const interactiveProps = (row: Row) => {
    const isSelected =
      selectedRowKey !== undefined && selectedRowKey === rowKey(row);

    return {
      onClick: activate(row),
      onKeyDown: activateByKey(row),
      tabIndex: onRowClick ? 0 : undefined,
      "aria-current": isSelected ? ("true" as const) : undefined,
      "data-state": isSelected ? "selected" : undefined,
    };
  };

  const actionsFor = (row: Row) => {
    const actions = rowActions?.(row) ?? [];
    if (actions.length === 0) return null;

    return (
      <DataTableRowActions
        actions={actions}
        rowName={rowLabel?.(row)}
        inlineCount={inlineActionCount}
        onRequestConfirm={requestConfirm(row)}
      />
    );
  };

  const ariaSort = (column: T.DataTableColumn<Row>) => {
    if (!column.isSortable || !onSortChange) return undefined;
    if (sort?.id !== column.id) return "none" as const;
    return sort.direction === "asc"
      ? ("ascending" as const)
      : ("descending" as const);
  };

  const headerContent = (column: T.DataTableColumn<Row>) => {
    if (!column.isSortable || !onSortChange) return column.header;

    const isActive = sort?.id === column.id;
    const Icon = !isActive
      ? ArrowUpDown
      : sort.direction === "asc"
        ? ArrowUp
        : ArrowDown;

    return (
      <button
        type="button"
        onClick={() => onSortChange(nextSort(sort, column.id))}
        className={cn(
          "-mx-1.5 inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 uppercase tracking-wider",
          "outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/35",
          isActive && "text-primary",
          column.align === "end" && "flex-row-reverse",
        )}
      >
        {column.header}
        <Icon
          aria-hidden
          className={cn("size-3.5", !isActive && "opacity-50")}
        />
      </button>
    );
  };

  const errorState: T.DataTableState | null =
    error ??
    (isError
      ? {
          icon: CircleAlert,
          title: t("dataTable.error.title"),
          description: t("dataTable.error.description"),
          action: onRetry ? (
            <Button
              radius="lg"
              type="button"
              variant="outline"
              onClick={onRetry}
            >
              <RefreshCw aria-hidden />
              {t("dataTable.error.retry")}
            </Button>
          ) : undefined,
        }
      : null);

  const selectableKeys = selection
    ? rows.filter((row) => selection.isSelectable?.(row) ?? true).map(rowKey)
    : [];
  const isAllSelected =
    selectableKeys.length > 0 &&
    selectableKeys.every((key) => selection?.selectedKeys.includes(key));

  const selectCheckbox = (row: Row) => {
    if (!selection) return null;
    const key = rowKey(row);
    const isSelectable = selection.isSelectable?.(row) ?? true;

    return (
      <Checkbox
        aria-label={`${selection.label}: ${rowLabel?.(row) ?? key}`}
        checked={selection.selectedKeys.includes(key)}
        disabled={selection.isDisabled || !isSelectable}
        onCheckedChange={() => selection.onToggle(key)}
      />
    );
  };

  const hasActions = Boolean(rowActions);
  const isEmpty = !isLoading && !errorState && rows.length === 0;
  const emptyState = isFiltered && filteredEmpty ? filteredEmpty : empty;
  const showPagination =
    Boolean(pagination) &&
    !isLoading &&
    !errorState &&
    (rows.length > 0 || (pagination?.page ?? 1) > 1);

  const desktopTable = (
    <div
      className={cn(
        "relative hidden overflow-x-auto md:block",
        scrollClassName,
      )}
    >
      <table className="w-full border-separate border-spacing-0 text-left text-sm">
        <caption className="sr-only">{caption}</caption>

        <thead>
          <tr>
            {selection ? (
              <th
                scope="col"
                className="sticky top-0 z-[1] h-11 w-px border-b bg-muted pr-1 pl-5"
              >
                <Checkbox
                  checked={isAllSelected}
                  aria-label={selection.allLabel}
                  disabled={selection.isDisabled || selectableKeys.length === 0}
                  onCheckedChange={() => selection.onToggleAll(selectableKeys)}
                />
              </th>
            ) : null}

            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                aria-sort={ariaSort(column)}
                className={cn(
                  "sticky top-0 z-[1] h-11 whitespace-nowrap border-b bg-muted px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground first:pl-5",
                  column.align === "end" && "text-right",
                  !hasActions && "last:pr-5",
                )}
              >
                {headerContent(column)}
              </th>
            ))}

            {hasActions ? (
              <th
                scope="col"
                className="sticky top-0 z-[1] h-11 w-px border-b bg-muted pr-5 pl-2"
              >
                <span className="sr-only">{t("dataTable.actions")}</span>
              </th>
            ) : null}
          </tr>
        </thead>

        <tbody
          className={cn(
            "transition-opacity",
            isFetching && !isLoading && "opacity-60",
          )}
        >
          {isLoading
            ? Array.from({ length: skeletonRows }, (_, index) => (
                <tr key={index}>
                  {selection ? <td className="border-b pr-1 pl-5" /> : null}
                  {columns.map((column, columnIndex) => (
                    <td
                      key={column.id}
                      className="border-b px-4 py-4 first:pl-5 last:pr-5"
                    >
                      <Skeleton
                        className={cn(
                          "h-3.5 rounded-full",
                          columnIndex === 0 ? "w-40" : "w-20",
                          column.align === "end" && "ml-auto",
                        )}
                      />
                    </td>
                  ))}
                  {hasActions ? <td className="border-b pr-5" /> : null}
                </tr>
              ))
            : rows.map((row) => {
                const props = interactiveProps(row);

                return (
                  <tr
                    key={rowKey(row)}
                    {...props}
                    className={cn(
                      "group/row transition-colors hover:bg-muted/50 [&:last-child>td]:border-b-0",
                      onRowClick &&
                        "cursor-pointer outline-none focus-visible:bg-accent",
                      props["data-state"] === "selected" &&
                        "bg-accent shadow-[inset_3px_0_0_0_var(--color-primary)] hover:bg-accent",
                    )}
                  >
                    {selection ? (
                      <td className="border-b pr-1 pl-5 align-middle">
                        {selectCheckbox(row)}
                      </td>
                    ) : null}

                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={cn(
                          "border-b px-4 py-3 align-middle whitespace-nowrap text-foreground first:pl-5",
                          !hasActions && "last:pr-5",
                          column.align === "end" && "text-right tabular-nums",
                          column.className,
                        )}
                      >
                        {column.cell(row)}
                      </td>
                    ))}

                    {hasActions ? (
                      <td className="border-b py-2 pr-4 pl-2 align-middle">
                        {actionsFor(row)}
                      </td>
                    ) : null}
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );

  const mobileCards = (
    <div className="space-y-3 md:hidden">
      {canSort && !isLoading && rows.length > 0 && onSortChange ? (
        <DataTableSortSheet
          sort={sort}
          onSortChange={onSortChange}
          columns={sortableColumns.map(({ id, header }) => ({ id, header }))}
        />
      ) : null}

      <ul
        aria-label={caption}
        className={cn(
          "grid grid-cols-1 gap-3 transition-opacity",
          isFetching && !isLoading && "opacity-60",
        )}
      >
        {isLoading
          ? Array.from({ length: Math.min(skeletonRows, 3) }, (_, index) => (
              <li key={index} className="space-y-3 rounded-lg border p-4">
                <Skeleton className="h-4 w-3/5 rounded-full" />
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-3 w-4/5 rounded-full" />
                  <Skeleton className="h-3 w-3/5 rounded-full" />
                  <Skeleton className="h-3 w-2/3 rounded-full" />
                  <Skeleton className="h-3 w-1/2 rounded-full" />
                </div>
              </li>
            ))
          : rows.map((row) => {
              const props = interactiveProps(row);
              const actions = actionsFor(row);

              return (
                <li key={rowKey(row)}>
                  <div
                    {...props}
                    className={cn(
                      "space-y-3 rounded-lg border bg-background p-4 transition-colors",
                      onRowClick &&
                        "cursor-pointer outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35",
                      props["data-state"] === "selected" &&
                        "border-primary bg-accent",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {selection ? (
                        <span className="pt-0.5">{selectCheckbox(row)}</span>
                      ) : null}

                      <div className="min-w-0 flex-1 space-y-0.5 break-words font-medium">
                        {titleColumns.map(({ column }) => (
                          <div key={column.id}>{column.cell(row)}</div>
                        ))}
                      </div>

                      {badgeColumns.length > 0 ? (
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          {badgeColumns.map(({ column }) => (
                            <div key={column.id}>{column.cell(row)}</div>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    {metaColumns.length > 0 ? (
                      <dl className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                        {metaColumns.map(({ column, slot }) => (
                          <div
                            key={column.id}
                            className={cn(
                              "min-w-0",
                              slot === "wide" && "col-span-2",
                            )}
                          >
                            <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                              {column.header}
                            </dt>
                            <dd className="mt-0.5 break-words text-sm text-foreground">
                              {column.cell(row)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}

                    {actions ? (
                      <div className="-mx-1 -mb-1 border-t pt-2">{actions}</div>
                    ) : null}
                  </div>
                </li>
              );
            })}
      </ul>
    </div>
  );

  return (
    <div className={cn("space-y-4", className)}>
      {toolbar}

      <div
        aria-busy={isLoading || isFetching ? true : undefined}
        className="relative md:overflow-hidden md:rounded-lg md:border md:bg-background"
      >
        {isFetching && !isLoading ? (
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 z-[2] h-0.5 animate-pulse bg-primary motion-reduce:animate-none"
          />
        ) : null}

        <span className="sr-only" aria-live="polite">
          {isFetching && !isLoading ? t("dataTable.updating") : ""}
        </span>

        {errorState ? (
          <DataTableStatePanel state={errorState} isError />
        ) : isEmpty ? (
          <DataTableStatePanel state={emptyState} />
        ) : (
          <>
            {desktopTable}
            {mobileCards}
          </>
        )}

        {showPagination && pagination ? (
          <div className="pt-4 md:border-t md:px-5 md:py-3">
            <DataTablePagination
              rowCount={rows.length}
              pagination={pagination}
              isBusy={Boolean(isFetching)}
            />
          </div>
        ) : null}
      </div>

      {rowActions ? (
        <ConfirmDialog
          open={isConfirmOpen}
          onOpenChange={(open) => {
            if (!open && !isConfirming) setIsConfirmOpen(false);
          }}
          onConfirm={confirmPending}
          onCloseAutoFocus={(event) => {
            if (!returnFocusRef.current?.isConnected) return;
            event.preventDefault();
            returnFocusRef.current.focus();
          }}
          title={pending?.confirm.title ?? ""}
          description={pending?.confirm.description}
          cancelText={pending?.confirm.cancelLabel}
          confirmText={pending?.confirm.confirmLabel}
          isLoading={isConfirming || Boolean(pendingAction?.isPending)}
          confirmVariant={pending?.isDanger ? "destructive" : "default"}
        />
      ) : null}
    </div>
  );
};
