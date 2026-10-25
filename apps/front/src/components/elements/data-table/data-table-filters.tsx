"use client";

import { ChevronDown, FilterX, Search } from "lucide-react";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Switch } from "@ui/switch";
import { Input } from "@ui/input";
import { cn } from "@/lib/utils";

import type * as T from "@/types/data-table.types";

import * as U from "@/utils/data-table.util";
import * as D from "@ui/dropdown-menu";
import * as SH from "@ui/sheet";

const PILL_CLASS_NAME = cn(
  "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-dashed bg-background px-3 text-sm text-muted-foreground",
  "outline-none transition-colors hover:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/35",
  "disabled:pointer-events-none disabled:opacity-50",
);

const ACTIVE_PILL_CLASS_NAME =
  "border-solid border-primary bg-accent text-primary";

const SelectPill = ({ filter }: { filter: T.DataTableSelectFilter }) => {
  const isActive = U.isFilterActive(filter);

  return (
    <D.DropdownMenu>
      <D.DropdownMenuTrigger
        disabled={filter.isDisabled}
        className={cn(PILL_CLASS_NAME, isActive && ACTIVE_PILL_CLASS_NAME)}
      >
        {filter.label}:
        <span
          className={cn(
            "max-w-40 truncate font-semibold",
            isActive ? "text-primary" : "text-foreground",
          )}
        >
          {U.selectedOptionLabel(filter)}
        </span>
        <ChevronDown aria-hidden className="size-4 opacity-60" />
      </D.DropdownMenuTrigger>

      <D.DropdownMenuContent align="start" className="max-h-80 min-w-52">
        <D.DropdownMenuRadioGroup
          value={filter.value}
          onValueChange={filter.onChange}
        >
          {filter.options.map((option) => (
            <D.DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className="py-2"
            >
              {option.label}
            </D.DropdownMenuRadioItem>
          ))}
        </D.DropdownMenuRadioGroup>
      </D.DropdownMenuContent>
    </D.DropdownMenu>
  );
};

const TogglePill = ({ filter }: { filter: T.DataTableToggleFilter }) => (
  <label
    className={cn(
      PILL_CLASS_NAME,
      "cursor-pointer gap-2.5 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/35",
      filter.value && ACTIVE_PILL_CLASS_NAME,
    )}
  >
    <Switch checked={filter.value} onCheckedChange={filter.onChange} />
    {filter.label}
  </label>
);

const DatePill = ({ filter }: { filter: T.DataTableDateFilter }) => (
  <label
    className={cn(
      PILL_CLASS_NAME,
      "cursor-pointer has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/35",
      filter.value && ACTIVE_PILL_CLASS_NAME,
    )}
  >
    {filter.label}
    <Input
      type="date"
      min={filter.min}
      max={filter.max}
      value={filter.value}
      onChange={(event) => filter.onChange(event.target.value)}
      className="h-8 w-36 border-0 bg-transparent px-1 font-semibold text-foreground shadow-none focus-visible:ring-0"
    />
  </label>
);

const TextPill = ({ filter }: { filter: T.DataTableTextFilter }) => (
  <label
    className={cn(
      PILL_CLASS_NAME,
      "cursor-text has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/35",
      filter.value && ACTIVE_PILL_CLASS_NAME,
    )}
  >
    {filter.label}
    <Input
      value={filter.value}
      placeholder={filter.placeholder}
      onChange={(event) => filter.onChange(event.target.value)}
      className="h-8 w-32 border-0 bg-transparent px-1 font-semibold text-foreground shadow-none focus-visible:ring-0"
    />
  </label>
);

const FilterPill = ({ filter }: { filter: T.DataTableFilter }) => {
  if (filter.type === "select") return <SelectPill filter={filter} />;
  if (filter.type === "toggle") return <TogglePill filter={filter} />;
  if (filter.type === "text") return <TextPill filter={filter} />;
  return <DatePill filter={filter} />;
};

const SheetField = ({ filter }: { filter: T.DataTableFilter }) => {
  if (filter.type === "toggle")
    return (
      <label className="flex min-h-11 items-center justify-between gap-3 text-sm font-medium">
        {filter.label}
        <Switch checked={filter.value} onCheckedChange={filter.onChange} />
      </label>
    );

  if (filter.type === "date" || filter.type === "text")
    return (
      <label className="grid gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {filter.label}
        </span>
        <Input
          type={filter.type}
          value={filter.value}
          className="h-11 rounded-lg"
          onChange={(event) => filter.onChange(event.target.value)}
        />
      </label>
    );

  return (
    <fieldset className="grid gap-2" disabled={filter.isDisabled}>
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {filter.label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {filter.options.map((option) => {
          const isSelected = option.value === filter.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => filter.onChange(option.value)}
              className={cn(
                "min-h-10 rounded-full border px-3.5 text-sm font-medium transition-colors",
                "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35 disabled:opacity-50",
                isSelected
                  ? "border-primary bg-accent text-primary"
                  : "bg-background text-foreground hover:border-primary",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};

export const DataTableFilters = ({
  search,
  actions,
  onReset,
  className,
  isFiltered,
  filters: rawFilters,
}: T.DataTableFiltersProps) => {
  const { t } = useI18n();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const filters = U.presentFilters(rawFilters);
  const active = filters.filter(U.isFilterActive);
  const canReset =
    Boolean(onReset) &&
    (isFiltered ?? (active.length > 0 || Boolean(search?.value)));

  const chipLabel = (filter: T.DataTableFilter) => {
    if (filter.type === "select")
      return `${filter.label}: ${U.selectedOptionLabel(filter)}`;
    if (filter.type === "date" || filter.type === "text")
      return `${filter.label}: ${filter.value}`;
    return filter.label;
  };

  const searchField = search ? (
    <div className="relative min-w-0 flex-1 md:max-w-sm md:min-w-56">
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        value={search.value}
        aria-label={search.label}
        placeholder={search.placeholder}
        className="h-10 rounded-lg bg-background pl-9"
        onChange={(event) => search.onChange(event.target.value)}
      />
    </div>
  ) : null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {searchField}

        <div className="hidden flex-wrap items-center gap-2 md:flex">
          {filters.map((filter) => (
            <FilterPill key={filter.id} filter={filter} />
          ))}

          {canReset ? (
            <Button
              size="sm"
              type="button"
              variant="ghost"
              onClick={onReset}
              className="h-10 text-muted-foreground hover:text-primary"
            >
              <FilterX aria-hidden />
              {t("dataTable.reset")}
            </Button>
          ) : null}
        </div>

        {filters.length > 0 ? (
          <SH.Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SH.SheetTrigger asChild>
              <Button
                type="button"
                radius="lg"
                variant="outline"
                className="h-10 md:hidden"
              >
                <SlidersHorizontal aria-hidden />
                {t("dataTable.filters")}
                {active.length > 0 ? (
                  <span className="grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] leading-5 text-primary-foreground">
                    {active.length}
                  </span>
                ) : null}
              </Button>
            </SH.SheetTrigger>

            <SH.SheetContent
              side="bottom"
              className="max-h-[85dvh] gap-0 rounded-t-2xl md:hidden"
            >
              <SH.SheetHeader className="pb-2">
                <SH.SheetTitle>{t("dataTable.filters")}</SH.SheetTitle>
                <SH.SheetDescription className="sr-only">
                  {t("dataTable.filtersDescription")}
                </SH.SheetDescription>
              </SH.SheetHeader>

              <div className="grid min-h-0 gap-6 overflow-y-auto px-4 pb-4">
                {filters.map((filter) => (
                  <SheetField key={filter.id} filter={filter} />
                ))}
              </div>

              <SH.SheetFooter className="grid grid-cols-[1fr_2fr] gap-2 border-t">
                <Button
                  type="button"
                  radius="lg"
                  variant="outline"
                  disabled={!canReset}
                  onClick={onReset}
                >
                  {t("dataTable.reset")}
                </Button>
                <SH.SheetClose asChild>
                  <Button type="button" radius="lg">
                    {t("dataTable.showResults")}
                  </Button>
                </SH.SheetClose>
              </SH.SheetFooter>
            </SH.SheetContent>
          </SH.Sheet>
        ) : null}

        {actions ? (
          <div className="flex w-full flex-wrap items-center gap-2 md:ml-auto md:w-auto">
            {actions}
          </div>
        ) : null}
      </div>

      {active.length > 0 ? (
        <ul
          aria-label={t("dataTable.activeFilters")}
          className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] md:flex-wrap md:overflow-visible md:pb-0"
        >
          {active.map((filter) => (
            <li key={filter.id} className="shrink-0">
              <button
                type="button"
                onClick={() => U.clearFilter(filter)}
                aria-label={t("dataTable.removeFilter", {
                  filter: chipLabel(filter),
                })}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full bg-accent pr-2 pl-3 text-xs font-semibold text-primary max-md:h-10",
                  "outline-none transition-colors hover:bg-primary/15 focus-visible:ring-[3px] focus-visible:ring-ring/35",
                )}
              >
                {chipLabel(filter)}
                <X aria-hidden className="size-3.5" />
              </button>
            </li>
          ))}

          {canReset ? (
            <li className="shrink-0">
              <button
                type="button"
                onClick={onReset}
                className="h-8 rounded-full px-2.5 text-xs font-semibold text-muted-foreground outline-none hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/35 max-md:h-10"
              >
                {t("dataTable.clearAll")}
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
};
