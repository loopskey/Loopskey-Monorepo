import { TMetricCard, TMetricCardTone } from "@/types/professional-dashboard.types";
import { GlassCard } from "@elements/glass-card";
import { cn } from "@/lib/utils";

const TONE_CLASSES: Record<TMetricCardTone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success-soft text-success-soft-foreground",
  warning: "bg-warning-soft text-warning-soft-foreground",
  danger: "bg-destructive-soft text-destructive-soft-foreground",
};

export const MetricCard = ({
  icon: Icon,
  label,
  value,
  helper,
  tone = "primary",
}: TMetricCard) => {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div className={cn("rounded-md p-3", TONE_CLASSES[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-5 text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-medium">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{helper}</p>
    </GlassCard>
  );
};
