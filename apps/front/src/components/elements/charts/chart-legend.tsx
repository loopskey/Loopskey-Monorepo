import { cn } from "@/lib/utils";

import type { ChartLegendKind, ChartLegendProps } from "@/types/chart.types";

const KEY_CLASS_NAMES: Record<ChartLegendKind, string> = {
  rect: "size-2.5 rounded-[3px]",
  line: "h-0.5 w-3.5 rounded-full",
  dash: "h-0 w-3.5 border-t-2 border-dashed border-muted-foreground",
  marker: "h-3 w-0.5 rounded-full bg-foreground",
};

export const ChartLegend = ({ items, className }: ChartLegendProps) => (
  <ul
    className={cn(
      "flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-foreground",
      className,
    )}
  >
    {items.map((item) => {
      const kind = item.kind ?? "rect";

      return (
        <li key={item.id} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className={cn("inline-block shrink-0", KEY_CLASS_NAMES[kind])}
            style={
              kind === "rect" || kind === "line"
                ? { background: item.color }
                : undefined
            }
          />
          {item.label}
        </li>
      );
    })}
  </ul>
);
