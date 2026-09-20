"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { TFilterPanelProps } from "@/types/content-module.types";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

import * as S from "@ui/select";

const FilterPanel = ({
  title,
  filters,
  onReset,
  totalCount,
}: TFilterPanelProps) => {
  const { t } = useI18n();

  return (
    <GlassCard className="p-4" glow={false}>
      <div className="relative z-10 flex flex-col gap-4 xl:flex-row xl:items-end">
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <SlidersHorizontal className="h-4 w-4" />
          </div>

          <div>
            <h2 className="font-extrabold">{title}</h2>

            {typeof totalCount === "number" && (
              <p className="mt-1 text-sm text-muted-foreground">
                {t("content.filters.totalResults", { total: totalCount })}
              </p>
            )}
          </div>
        </div>

        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filters.map((filter) => (
            <div key={filter.key} className="flex flex-col gap-2">
              <label className="text-sm font-bold text-foreground/90">
                {filter.label}
              </label>

              <S.Select
                value={filter.value || "ALL"}
                onValueChange={(value) =>
                  filter.onChange(value === "ALL" ? "" : value)
                }
              >
                <S.SelectTrigger className="h-12 w-full rounded-md border-border/70 bg-muted shadow-sm">
                  <S.SelectValue placeholder={filter.placeholder} />
                </S.SelectTrigger>

                <S.SelectContent className="rounded-md">
                  <S.SelectGroup>
                    <S.SelectItem value="ALL">
                      {t("content.filters.all")}
                    </S.SelectItem>

                    {filter.options.map((option) => (
                      <S.SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </S.SelectItem>
                    ))}
                  </S.SelectGroup>
                </S.SelectContent>
              </S.Select>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          radius="xl"
          className="w-full justify-center xl:w-auto"
          onClick={onReset}
        >
          <RotateCcw className="h-4 w-4" />
          {t("content.filters.reset")}
        </Button>
      </div>
    </GlassCard>
  );
};

export default FilterPanel;
