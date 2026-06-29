import { TOverviewMetricCard } from "@/types/admin-dashboard.types";
import { GlassCard } from "@elements/glass-card";

export const MetricCard = ({
  title,
  value,
  icon: Icon,
  description,
}: TOverviewMetricCard) => (
  <GlassCard className="p-5">
    <div className="relative z-10 flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-3 text-3xl font-medium tracking-tight">{value}</p>
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      </div>

      <div className="rounded-2xl bg-primary/10 p-3 text-primary">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </GlassCard>
);
