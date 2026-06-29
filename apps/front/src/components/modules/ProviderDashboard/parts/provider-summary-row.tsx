import { cn } from "@/lib/utils";
import { TSummaryRow } from "@/types/providers.types";

export const SummaryRow = ({ label, value, className }: TSummaryRow) => (
  <div
    className={cn(
      "flex items-center justify-between rounded-2xl px-4 py-3",
      className,
    )}
  >
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-lg font-medium">{value}</span>
  </div>
);
