"use client";

import { TAssociationOverviewPanelProps } from "@/types/association-dashboard.types";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";

import * as L from "lucide-react";

export const AssociationOverviewPanel = ({
  title,
  action,
  retry,
  isError,
  children,
  skeleton,
  isLoading,
  retryLabel,
  description,
  errorMessage,
}: TAssociationOverviewPanelProps) => (
  <GlassCard glow={false}>
    <div className="relative z-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">{title}</h2>

          {description && (
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {!isError && action}
      </div>

      <div className="mt-5">
        {isError ? (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-glass-border p-5">
            <p role="alert" className="text-sm text-muted-foreground">
              <L.TriangleAlert className="mr-2 inline h-4 w-4 text-destructive" />
              {errorMessage}
            </p>

            <Button size="sm" radius="xl" variant="glass" onClick={retry}>
              <L.RotateCcw className="h-4 w-4" />
              {retryLabel}
            </Button>
          </div>
        ) : isLoading ? (
          (skeleton ?? <Skeleton className="h-40 w-full rounded-2xl" />)
        ) : (
          children
        )}
      </div>
    </div>
  </GlassCard>
);
