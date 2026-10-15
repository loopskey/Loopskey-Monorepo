"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { pageWindow } from "@/utils/data-table.util";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import type { DataTablePagination as Pagination } from "@/types/data-table.types";

import * as S from "@ui/select";

type DataTablePaginationProps = {
  isBusy: boolean;
  rowCount: number;
  pagination: Pagination;
};

const STEP_CLASS_NAME =
  "size-9 text-muted-foreground hover:text-primary max-md:size-11";

export const DataTablePagination = ({
  isBusy,
  rowCount,
  pagination,
}: DataTablePaginationProps) => {
  const { t, language } = useI18n();
  const format = (value: number) => value.toLocaleString(language);

  const isFirst = pagination.page <= 1;
  const isLast =
    pagination.kind === "pages"
      ? pagination.page >= pagination.pageCount
      : !pagination.hasNextPage;

  const goPrevious = () =>
    pagination.kind === "pages"
      ? pagination.onPageChange(pagination.page - 1)
      : pagination.onPrevious();

  const goNext = () =>
    pagination.kind === "pages"
      ? pagination.onPageChange(pagination.page + 1)
      : pagination.onNext();

  const summary = () => {
    if (pagination.kind === "pages") {
      const from =
        pagination.total === 0
          ? 0
          : (pagination.page - 1) * pagination.pageSize + 1;
      return t("dataTable.range", {
        from: format(from),
        to: format(from === 0 ? 0 : from + rowCount - 1),
        total: format(pagination.total),
      });
    }

    const page = t("dataTable.page", { page: format(pagination.page) });
    return typeof pagination.total === "number"
      ? `${page} · ${t("dataTable.total", { total: format(pagination.total) })}`
      : page;
  };

  return (
    <nav
      aria-label={t("dataTable.pagination")}
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-muted-foreground"
    >
      <p className="tabular-nums" aria-live="polite">
        {summary()}
      </p>

      <div className="flex items-center gap-3">
        {pagination.kind === "pages" &&
        pagination.onPageSizeChange &&
        pagination.pageSizeOptions ? (
          <label className="hidden items-center gap-2 md:flex">
            <span>{t("dataTable.rowsPerPage")}</span>
            <S.Select
              value={String(pagination.pageSize)}
              onValueChange={(value) =>
                pagination.onPageSizeChange?.(Number(value))
              }
            >
              <S.SelectTrigger size="sm" className="w-20 rounded-md">
                <S.SelectValue />
              </S.SelectTrigger>
              <S.SelectContent>
                {pagination.pageSizeOptions.map((size) => (
                  <S.SelectItem key={size} value={String(size)}>
                    {size}
                  </S.SelectItem>
                ))}
              </S.SelectContent>
            </S.Select>
          </label>
        ) : null}

        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={goPrevious}
            disabled={isFirst || isBusy}
            className={STEP_CLASS_NAME}
            aria-label={t("dataTable.previous")}
          >
            <ChevronLeft aria-hidden />
          </Button>

          {pagination.kind === "pages" ? (
            <>
              <ol className="hidden items-center gap-1 md:flex">
                {pageWindow(pagination.page, pagination.pageCount).map(
                  (entry) =>
                    typeof entry === "number" ? (
                      <li key={entry}>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={isBusy}
                          aria-current={
                            entry === pagination.page ? "page" : undefined
                          }
                          onClick={() => pagination.onPageChange(entry)}
                          aria-label={t("dataTable.goToPage", {
                            page: format(entry),
                          })}
                          className={cn(
                            "size-9 min-w-9 px-2 tabular-nums text-foreground",
                            entry === pagination.page &&
                              "border border-primary bg-accent text-primary hover:bg-accent",
                          )}
                        >
                          {format(entry)}
                        </Button>
                      </li>
                    ) : (
                      <li
                        key={entry}
                        aria-hidden
                        className="grid size-9 place-items-center"
                      >
                        …
                      </li>
                    ),
                )}
              </ol>

              <span className="px-1 font-medium tabular-nums text-foreground md:hidden">
                {format(pagination.page)} / {format(pagination.pageCount)}
              </span>
            </>
          ) : (
            <span className="px-1 font-medium tabular-nums text-foreground">
              {format(pagination.page)}
            </span>
          )}

          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={goNext}
            disabled={isLast || isBusy}
            className={STEP_CLASS_NAME}
            aria-label={t("dataTable.next")}
          >
            <ChevronRight aria-hidden />
          </Button>
        </div>
      </div>
    </nav>
  );
};
