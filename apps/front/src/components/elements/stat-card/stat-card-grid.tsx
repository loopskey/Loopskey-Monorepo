import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import type {
  StatCardGridColumns,
  StatCardGridProps,
} from "@/types/stat-card.types";

const COLUMNS_CLASS_NAME: Record<StatCardGridColumns, string> = {
  2: "sm:grid-cols-2",
  3: "md:grid-cols-3",
  4: "sm:grid-cols-2 xl:grid-cols-4",
  5: "sm:grid-cols-2 xl:grid-cols-5",
};

export const StatCardGrid = ({
  error,
  children,
  className,
  columns = 4,
}: StatCardGridProps) => {
  if (error)
    return (
      <div
        className={cn(
          "flex flex-col items-start gap-3 rounded-xl border border-dashed bg-destructive-soft/40 p-4 sm:flex-row sm:items-center sm:justify-between md:p-5",
          className,
        )}
      >
        <p
          role="alert"
          className="flex items-center gap-2 text-sm font-medium text-foreground"
        >
          <TriangleAlert
            aria-hidden
            className="size-4 shrink-0 text-destructive"
          />
          {error.message}
        </p>

        <Button
          size="sm"
          radius="lg"
          type="button"
          variant="outline"
          onClick={error.onRetry}
        >
          <RotateCcw aria-hidden />
          {error.retryLabel}
        </Button>
      </div>
    );

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4",
        COLUMNS_CLASS_NAME[columns],
        className,
      )}
    >
      {children}
    </div>
  );
};
