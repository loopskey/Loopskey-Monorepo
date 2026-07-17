"use client";

import { CpdCertificationResultCardProps } from "@/types/cpd-plan.types";
import { Badge } from "@ui/badge";
import { cn } from "@/lib/utils";

import * as L from "lucide-react";

export const CpdCertificationResultCard = ({
  t,
  certification,
  onSelect,
}: CpdCertificationResultCardProps) => (
  <button
    type="button"
    onClick={() => onSelect(certification)}
    className={cn(
      "group flex w-full items-center gap-4 rounded-2xl border border-glass-border bg-background/50 p-4 text-left transition-all",
      "hover:border-primary/50 hover:bg-primary/5 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
    )}
  >
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{certification.abbreviation}</span>
        <span className="truncate text-sm text-muted-foreground">
          {certification.name}
        </span>
      </div>

      <p className="mt-1 truncate text-xs text-muted-foreground">
        {certification.association ?? certification.organization}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">
          {certification.totalRequiredCredits}{" "}
          {t(`cpdProgress.creditTypes.${certification.creditType}`)}
        </Badge>
        <Badge variant="outline">{certification.renewalCycleLabel}</Badge>
      </div>
    </div>

    <L.ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
  </button>
);
