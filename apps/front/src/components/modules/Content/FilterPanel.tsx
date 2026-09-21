"use client";

import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { TFilterPanelProps } from "@/types/content-module.types";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { cn } from "@/lib/utils";

import * as S from "@ui/select";
import * as Sh from "@ui/sheet";

type TFilter = TFilterPanelProps["filters"][number];

type TFilterSelectProps = {
  filter: TFilter;
  className?: string;
};

const FilterSelect = ({ filter, className }: TFilterSelectProps) => {
  const { t } = useI18n();

  return (
    <S.Select
      value={filter.value ?? ""}
      onValueChange={(value) => filter.onChange(value === "ALL" ? "" : value)}
    >
      <S.SelectTrigger
        aria-label={filter.label}
        className={cn(
          "h-12 w-full rounded-lg border-border/70 bg-background shadow-none",
          filter.value &&
            "border-primary bg-primary/5 font-semibold text-primary",
          className,
        )}
      >
        <S.SelectValue placeholder={filter.placeholder} />
      </S.SelectTrigger>

      <S.SelectContent className="rounded-md">
        <S.SelectGroup>
          <S.SelectItem value="ALL">{t("content.filters.all")}</S.SelectItem>

          {filter.options.map((option) => (
            <S.SelectItem key={option.value} value={option.value}>
              {option.label}
            </S.SelectItem>
          ))}
        </S.SelectGroup>
      </S.SelectContent>
    </S.Select>
  );
};

const FilterPanel = ({
  title,
  filters,
  onReset,
  search,
  onSearchChange,
}: TFilterPanelProps) => {
  const { t } = useI18n();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const activeFilterCount = filters.filter((filter) => filter.value).length;
  const hasActiveFilters = activeFilterCount > 0 || search.trim().length > 0;

  return (
    <div role="search" aria-label={title} className="flex items-center gap-3">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("content.filters.searchPlaceholder")}
          aria-label={t("content.filters.searchPlaceholder")}
          className="h-11 rounded-lg border-border/70 bg-background pl-10 shadow-none lg:h-12"
        />
      </div>

      <div className="hidden items-center gap-3 lg:flex">
        {filters.map((filter) => (
          <FilterSelect
            key={filter.key}
            filter={filter}
            className="w-44 xl:w-52"
          />
        ))}

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            className="text-primary"
            onClick={onReset}
          >
            <RotateCcw />
            {t("content.filters.reset")}
          </Button>
        )}
      </div>

      <Sh.Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <Sh.SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            radius="lg"
            className="h-11 lg:hidden"
          >
            <SlidersHorizontal />
            {t("content.filters.open")}
            {activeFilterCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </Sh.SheetTrigger>

        <Sh.SheetContent side="bottom" className="rounded-t-2xl">
          <Sh.SheetHeader>
            <Sh.SheetTitle>{title}</Sh.SheetTitle>
            <Sh.SheetDescription className="sr-only">
              {t("content.filters.sheetDescription")}
            </Sh.SheetDescription>
          </Sh.SheetHeader>

          <div className="grid gap-3 px-4">
            {filters.map((filter) => (
              <FilterSelect key={filter.key} filter={filter} />
            ))}
          </div>

          <Sh.SheetFooter className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={!hasActiveFilters}
              onClick={onReset}
            >
              <RotateCcw />
              {t("content.filters.reset")}
            </Button>

            <Button type="button" onClick={() => setIsSheetOpen(false)}>
              {t("content.filters.showResults")}
            </Button>
          </Sh.SheetFooter>
        </Sh.SheetContent>
      </Sh.Sheet>
    </div>
  );
};

export default FilterPanel;
