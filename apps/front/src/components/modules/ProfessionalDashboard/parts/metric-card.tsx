import { TMetricCard } from "@/types/professional-dashboard.types";
import { GlassCard } from "@elements/glass-card";

export const MetricCard = ({
  icon: Icon,
  label,
  value,
  helper,
}: TMetricCard) => {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-5 text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-medium">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{helper}</p>
    </GlassCard>
  );
};
