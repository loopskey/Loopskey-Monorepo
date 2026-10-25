import { WizardStepNodeProps } from "@/types/wizard-stepper.types";
import { Check, Lock, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const NODE_SIZE = {
  xs: "size-6 text-xs",
  sm: "size-7 text-xs",
  md: "size-8 text-sm",
} as const;

const ICON_SIZE = {
  xs: "size-3",
  sm: "size-3.5",
  md: "size-4",
} as const;

const NODE_STATUS = {
  done: "border-primary bg-primary text-primary-foreground",
  current: "border-primary bg-background text-primary ring-4 ring-primary/15",
  problem: "border-destructive bg-destructive-soft text-destructive",
  locked: "border-border bg-muted text-muted-foreground",
  upcoming: "border-input bg-background text-muted-foreground",
} as const;

export const WIZARD_STEP_TITLE = {
  done: "font-medium text-foreground",
  current: "font-semibold text-primary",
  problem: "font-semibold text-destructive",
  locked: "font-medium text-muted-foreground",
  upcoming: "font-medium text-foreground",
} as const;

export const WIZARD_STEP_EYEBROW =
  "text-xs font-semibold uppercase tracking-wider text-muted-foreground tabular-nums";

export const WIZARD_STEP_FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

export const WizardStepNode = ({
  number,
  status,
  size = "md",
}: WizardStepNodeProps) => {
  const iconClass = ICON_SIZE[size];

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border-2 font-semibold tabular-nums transition-colors",
        NODE_SIZE[size],
        NODE_STATUS[status],
      )}
    >
      {status === "done" && <Check className={iconClass} strokeWidth={3} />}
      {status === "locked" && <Lock className={iconClass} />}
      {status === "problem" && <TriangleAlert className={iconClass} />}
      {(status === "current" || status === "upcoming") && number}
    </span>
  );
};
