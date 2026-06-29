import { TStatsCard } from "@/types/professional-dashboard.types";
import { GlassCard } from "@elements/glass-card";

export const DashboardStatCard = ({
  title,
  value,
  icon: Icon,
  description,
}: TStatsCard) => {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-medium">{value}</p>
          {description ? (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>

        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </GlassCard>
  );
};
