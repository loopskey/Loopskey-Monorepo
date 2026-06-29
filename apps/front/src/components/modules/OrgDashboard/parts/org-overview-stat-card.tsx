"use client";

import { TOverviewStatCardProps } from "@/types/org-dashboard.types";
import { GlassCard } from "@elements/glass-card";

export const OverviewStatCard = ({
  hint,
  icon,
  title,
  value,
}: TOverviewStatCardProps) => {
  return (
    <GlassCard>
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            {icon}
          </div>
        </div>
        <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
        {hint && <p className="mt-2 text-sm text-muted-foreground">{hint}</p>}
      </div>
    </GlassCard>
  );
};
