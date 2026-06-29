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
    <GlassCard className="p-5" glow={false}>
      <div className="relative z-10">
        <div className="mb-5 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
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
          </div>

          <Button
            type="button"
            variant="glass"
            radius="xl"
            className="w-full justify-center"
            onClick={onReset}
          >
            <RotateCcw className="h-4 w-4" />
            {t("content.filters.reset")}
          </Button>
        </div>

        <div className="grid gap-4">
          {filters.map((filter) => (
            <div key={filter.key} className="space-y-2">
              <label className="text-sm font-bold text-foreground/90">
                {filter.label}
              </label>

              <S.Select
                value={filter.value || "ALL"}
                onValueChange={(value) =>
                  filter.onChange(value === "ALL" ? "" : value)
                }
              >
                <S.SelectTrigger className="h-12 rounded-2xl border-border/70 bg-background/60 shadow-sm backdrop-blur-xl">
                  <S.SelectValue placeholder={filter.placeholder} />
                </S.SelectTrigger>

                <S.SelectContent className="rounded-2xl">
                  <S.SelectItem value="ALL">
                    {t("content.filters.all")}
                  </S.SelectItem>

                  {filter.options.map((option) => (
                    <S.SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </S.SelectItem>
                  ))}
                </S.SelectContent>
              </S.Select>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

export default FilterPanel;
