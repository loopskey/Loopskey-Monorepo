import { TInfoRow } from "@/types/admin-dashboard.types";

export const InfoRow = ({ label, value }: TInfoRow) => (
  <div className="flex justify-between gap-4 border-b border-glass-border/60 pb-2 last:border-b-0 last:pb-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-right font-medium">{value ?? "-"}</span>
  </div>
);
