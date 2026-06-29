"use client";

import { TFieldProps } from "@/types/professional-dashboard.types";
import { Input } from "@ui/input";
import { Label } from "@ui/label";

export const Field = ({
  hint,
  label,
  value,
  onChange,
  placeholder,
}: TFieldProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground/90">{label}</Label>
      <Input
        value={value ?? ""}
        placeholder={placeholder}
        className="h-12 rounded-2xl bg-background/60"
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
};
