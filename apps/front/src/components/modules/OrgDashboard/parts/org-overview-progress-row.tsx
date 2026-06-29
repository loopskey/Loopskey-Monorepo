"use client";

import { TOverviewProgressRowProps } from "@/types/org-dashboard.types";
import { Progress } from "@ui/progress";

export const OverviewProgressRow = ({
  title,
  value,
  meta,
}: TOverviewProgressRowProps) => {
  return (
    <div className="rounded-2xl bg-background/50 p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground">{Math.round(value)}%</p>
      </div>
      <Progress value={value} />
      {meta && <p className="mt-2 text-xs text-muted-foreground">{meta}</p>}
    </div>
  );
};
