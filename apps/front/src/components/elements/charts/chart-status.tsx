import { CircleAlert, CircleCheck, CircleX, Info } from "lucide-react";
import { cn } from "@/lib/utils";

import type { ChartStatusProps, ChartStatusTone } from "@/types/chart.types";

const TONES: Record<ChartStatusTone, string> = {
  good: "bg-success-soft text-success-soft-foreground",
  warning: "bg-warning-soft text-warning-soft-foreground",
  critical: "bg-destructive-soft text-destructive-soft-foreground",
  info: "bg-accent text-primary",
};

const ICONS = {
  good: CircleCheck,
  warning: CircleAlert,
  critical: CircleX,
  info: Info,
} as const;

export const ChartStatus = ({
  tone,
  children,
  className,
}: ChartStatusProps) => {
  const Icon = ICONS[tone];

  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold",
        TONES[tone],
        className,
      )}
    >
      <Icon aria-hidden className="size-3.5 shrink-0" />
      {children}
    </span>
  );
};
