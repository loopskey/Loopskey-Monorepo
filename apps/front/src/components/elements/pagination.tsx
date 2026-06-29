"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { TContentPaginationProps } from "@/types/element.types";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

export const ContentPagination = ({
  page,
  onNext,
  className,
  isLoading,
  totalCount,
  onPrevious,
  hasNextPage,
  canPrevious,
}: TContentPaginationProps) => {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-4 rounded-3xl border border-glass-border bg-background/50 p-4 backdrop-blur-xl sm:flex-row",
        className,
      )}
    >
      <div className="text-sm text-muted-foreground">
        {t("content.pagination.page", { page })}
        {typeof totalCount === "number" && (
          <span className="ml-2">
            · {t("content.pagination.total", { total: totalCount })}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button
          radius="xl"
          type="button"
          variant="glass"
          onClick={onPrevious}
          disabled={!canPrevious || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
          {t("content.pagination.previous")}
        </Button>
        <Button
          radius="xl"
          type="button"
          variant="brand"
          onClick={onNext}
          disabled={!hasNextPage || isLoading}
        >
          {t("content.pagination.next")}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
