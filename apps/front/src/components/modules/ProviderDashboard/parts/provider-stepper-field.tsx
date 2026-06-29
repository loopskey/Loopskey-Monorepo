import { TStepperField } from "@/types/provider-dashboard.types";
import { Label } from "@ui/label";

export const Field = ({ label, children, className }: TStepperField) => (
  <div className={className}>
    <Label className="mb-2 block">{label}</Label>
    {children}
  </div>
);
