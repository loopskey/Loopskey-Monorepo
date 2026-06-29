import { TAdminStatCard } from "@/types/admin-dashboard.types";
import { GlassCard } from "@elements/glass-card";

export const StatCard = ({ icon: Icon, label, value }: TAdminStatCard) => (
  <GlassCard className="p-5">
    <div className="relative z-10 flex items-center gap-4">
      <div className="rounded-2xl bg-primary/10 p-3 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-medium">{value}</p>
      </div>
    </div>
  </GlassCard>
);
