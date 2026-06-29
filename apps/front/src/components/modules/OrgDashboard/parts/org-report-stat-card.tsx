import { TOrgReportStatCardProps } from "@/types/org-dashboard.types";
import { GlassCard } from "@elements/glass-card";

export const OrgReportStatCard = ({
  label,
  value,
  icon: Icon,
}: TOrgReportStatCardProps) => {
  return (
    <GlassCard>
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Icon className="h-5 w-5 text-primary" />
        </div>

        <p className="mt-3 text-3xl font-semibold">{value}</p>
      </div>
    </GlassCard>
  );
};
