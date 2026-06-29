import { TMiniMetric } from "@/types/providers.types";

export const MiniMetric = ({ label, value }: TMiniMetric) => (
  <div className="rounded-2xl bg-muted/45 p-3 text-center">
    <p className="font-medium text-foreground">{value}</p>
    <p className="mt-1 truncate">{label}</p>
  </div>
);
