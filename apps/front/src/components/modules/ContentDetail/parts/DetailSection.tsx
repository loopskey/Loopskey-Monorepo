import { TDetailSectionProps } from "@/types/content-module.types";
import { GlassCard } from "@elements/glass-card";

const DetailSection = ({ title, children }: TDetailSectionProps) => (
  <GlassCard className="space-y-4 p-5 md:p-6">
    <h2 className="text-xl font-medium tracking-tight">{title}</h2>
    {children}
  </GlassCard>
);

export default DetailSection;
