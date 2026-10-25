import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

type LandingSamplePanelProps = {
  titleId: string;
  eyebrow: string;
  title: string;
  sampleLabel: string;
  subtitle?: ReactNode;
  className?: string;
  children: ReactNode;
};

const LandingSamplePanel = ({
  titleId,
  eyebrow,
  title,
  sampleLabel,
  subtitle,
  className,
  children,
}: LandingSamplePanelProps) => (
  <div
    role="group"
    aria-labelledby={titleId}
    className={cn(
      "min-w-0 rounded-2xl border bg-card p-5 text-card-foreground shadow-lg sm:p-7",
      className,
    )}
  >
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {eyebrow}
        </p>
        <h3
          id={titleId}
          className="mt-1.5 text-lg font-semibold text-foreground sm:text-xl"
        >
          {title}
        </h3>
        {subtitle}
      </div>
      <span className="shrink-0 rounded-full border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {sampleLabel}
      </span>
    </div>
    {children}
  </div>
);

export default LandingSamplePanel;
