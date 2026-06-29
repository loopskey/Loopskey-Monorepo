import { TSnapShotProps } from "@/types/professional-dashboard.types";

export const SnapshotRow = ({ label, value }: TSnapShotProps) => (
  <div className="flex items-center justify-between rounded-2xl bg-muted/40 p-4">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);
