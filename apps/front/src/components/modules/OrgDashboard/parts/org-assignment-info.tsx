import { TOrgAssignmentInfo } from "@/types/org-dashboard.types";

export const AssignmentInfo = ({ label, value }: TOrgAssignmentInfo) => (
  <div className="rounded-2xl bg-background/45 p-4">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="mt-1 font-medium">{value ?? "-"}</p>
  </div>
);
