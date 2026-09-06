"use client";

import { ContentPagination } from "@elements/pagination";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";

import * as L from "lucide-react";

import type { TSortDirection } from "@utils/association-reports";
import type { ReactNode } from "react";

export type TReportColumn<TRow> = {
  id: string;
  header: string;
  isSortable?: boolean;
  cell: (row: TRow) => ReactNode;
};

type TReportTableProps<TRow> = {
  page: number;
  pages: number;
  total: number;
  sort: string;
  caption: string;
  emptyLabel: string;
  isLoading: boolean;
  rows: readonly TRow[];
  direction: TSortDirection;
  rowKey: (row: TRow) => string;
  columns: TReportColumn<TRow>[];
  sortLabel: (header: string) => string;
  onSort: (column: string) => void;
  onPage: (page: number) => void;
  onOpenRow?: (row: TRow) => void;
  openLabel?: (row: TRow) => string;
};

const SKELETON_ROWS = 6;

export const AssociationReportTable = <TRow,>({
  page,
  rows,
  sort,
  pages,
  total,
  onSort,
  onPage,
  rowKey,
  columns,
  caption,
  direction,
  isLoading,
  sortLabel,
  openLabel,
  onOpenRow,
  emptyLabel,
}: TReportTableProps<TRow>) => {
  if (isLoading)
    return (
      <div className="space-y-3" aria-busy="true">
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-2xl" />
        ))}
      </div>
    );

  if (rows.length === 0)
    return (
      <div className="rounded-3xl border border-dashed border-glass-border py-12 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );

  const ariaSort = (column: TReportColumn<TRow>) => {
    if (!column.isSortable) return undefined;
    if (sort !== column.id) return "none" as const;
    return direction === "asc"
      ? ("ascending" as const)
      : ("descending" as const);
  };

  const headerCell = (column: TReportColumn<TRow>) => {
    if (!column.isSortable) return column.header;

    return (
      <Button
        size="sm"
        type="button"
        variant="ghost"
        className="-ml-2 h-8 gap-1 px-2 text-xs uppercase"
        aria-label={sortLabel(column.header)}
        onClick={() => onSort(column.id)}
      >
        {column.header}

        {sort === column.id ? (
          direction === "asc" ? (
            <L.ArrowUp className="h-3.5 w-3.5" />
          ) : (
            <L.ArrowDown className="h-3.5 w-3.5" />
          )
        ) : (
          <L.ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
        )}
      </Button>
    );
  };

  const openButton = (row: TRow) =>
    onOpenRow && (
      <Button
        size="sm"
        radius="xl"
        type="button"
        variant="glass"
        onClick={() => onOpenRow(row)}
        aria-label={openLabel?.(row) ?? undefined}
      >
        <L.UserSearch className="h-4 w-4" />
      </Button>
    );

  return (
    <div className="space-y-4">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <caption className="sr-only">{caption}</caption>

          <thead className="text-xs uppercase text-muted-foreground">
            <tr className="border-b border-glass-border">
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className="py-3 pr-4"
                  aria-sort={ariaSort(column)}
                >
                  {headerCell(column)}
                </th>
              ))}

              {onOpenRow && <th scope="col" className="py-3" />}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                className="border-b border-glass-border/70 transition-colors hover:bg-primary/5"
              >
                {columns.map((column) => (
                  <td key={column.id} className="py-4 pr-4 align-middle">
                    {column.cell(row)}
                  </td>
                ))}

                {onOpenRow && (
                  <td className="py-4 text-right">{openButton(row)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li
            key={rowKey(row)}
            className="rounded-3xl border border-glass-border bg-background/50 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 font-medium">{columns[0]?.cell(row)}</div>

              {openButton(row)}
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {columns.slice(1).map((column) => (
                <div key={column.id}>
                  <dt className="text-xs uppercase text-muted-foreground">
                    {column.header}
                  </dt>
                  <dd className="mt-1">{column.cell(row)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>

      <ContentPagination
        page={page}
        totalCount={total}
        isLoading={false}
        canPrevious={page > 1}
        hasNextPage={page < pages}
        onNext={() => onPage(page + 1)}
        onPrevious={() => onPage(page - 1)}
      />
    </div>
  );
};
