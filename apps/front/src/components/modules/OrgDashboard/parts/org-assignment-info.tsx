import { TOrgAssignmentInfo } from "@/types/org-dashboard.types";

export const AssignmentInfo = ({ label, value }: TOrgAssignmentInfo) => (
  <div className="rounded-md bg-muted p-4">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="mt-1 font-medium">{value ?? "-"}</p>
  </div>
);
