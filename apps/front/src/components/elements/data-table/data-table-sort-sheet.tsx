"use client";

import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import { ArrowUpDown, Check } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import type * as T from "@/types/data-table.types";

import * as SH from "@ui/sheet";

type DataTableSortSheetProps = {
  sort?: T.DataTableSort;
  columns: { id: string; header: string }[];
  onSortChange: (sort: T.DataTableSort) => void;
};

const DIRECTIONS: T.DataTableSortDirection[] = ["asc", "desc"];

export const DataTableSortSheet = ({
  sort,
  columns,
  onSortChange,
}: DataTableSortSheetProps) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const current = columns.find((column) => column.id === sort?.id);
  const direction = sort?.direction ?? "asc";

  return (
    <div className="flex items-center justify-between gap-3 md:hidden">
      <p className="min-w-0 truncate text-sm text-muted-foreground">
        {current
          ? t("dataTable.sortedBy", {
              column: current.header,
              direction: t(`dataTable.direction.${direction}`),
            })
          : t("dataTable.defaultOrder")}
      </p>

      <SH.Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SH.SheetTrigger asChild>
          <Button type="button" size="sm" variant="outline" radius="lg">
            <ArrowUpDown aria-hidden />
            {t("dataTable.sort")}
          </Button>
        </SH.SheetTrigger>

        <SH.SheetContent
          side="bottom"
          className="max-h-[85dvh] gap-0 rounded-t-2xl"
        >
          <SH.SheetHeader className="pb-2">
            <SH.SheetTitle>{t("dataTable.sort")}</SH.SheetTitle>
            <SH.SheetDescription className="sr-only">
              {t("dataTable.sortDescription")}
            </SH.SheetDescription>
          </SH.SheetHeader>

          <div className="space-y-5 overflow-y-auto px-4 pb-6">
            <ul className="grid gap-1" aria-label={t("dataTable.sortColumn")}>
              {columns.map((column) => {
                const isActive = column.id === sort?.id;

                return (
                  <li key={column.id}>
                    <button
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => onSortChange({ id: column.id, direction })}
                      className={cn(
                        "flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-left text-sm font-medium",
                        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35",
                        isActive
                          ? "bg-accent text-primary"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      {column.header}
                      {isActive ? (
                        <Check aria-hidden className="size-4" />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div
              role="group"
              aria-label={t("dataTable.sortDirection")}
              className="grid grid-cols-2 gap-2"
            >
              {DIRECTIONS.map((entry) => {
                const Icon =
                  entry === "asc" ? ArrowUpNarrowWide : ArrowDownWideNarrow;

                return (
                  <Button
                    key={entry}
                    type="button"
                    radius="lg"
                    disabled={!current}
                    aria-pressed={direction === entry}
                    variant={direction === entry ? "default" : "outline"}
                    onClick={() =>
                      current &&
                      onSortChange({ id: current.id, direction: entry })
                    }
                  >
                    <Icon aria-hidden />
                    {t(`dataTable.direction.${entry}`)}
                  </Button>
                );
              })}
            </div>

            <SH.SheetClose asChild>
              <Button
                type="button"
                radius="lg"
                variant="outline"
                className="w-full"
              >
                {t("dataTable.done")}
              </Button>
            </SH.SheetClose>
          </div>
        </SH.SheetContent>
      </SH.Sheet>
    </div>
  );
};
