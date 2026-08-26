"use client";

import { TRoadmapStatusProps } from "@/types/professional-roadmap-chat.types";
import { RoadmapDraftStatus } from "@/lib/graphql/base";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import Link from "next/link";

import * as L from "lucide-react";

const ROADMAP_CHAT_HREF = "/dashboard/professional/roadmap-chat";

export const RoadmapGenerationStatus = ({
  t,
  status,
  failureReason,
}: TRoadmapStatusProps) => {
  const key = "professionalDashboard.roadmap";

  if (status === RoadmapDraftStatus.Failed)
    return (
      <GlassCard className="p-8">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-2xl bg-destructive/10 p-3 text-destructive">
            <L.AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>

          <h2 className="mt-4 text-xl font-medium">
            {t(`${key}.failed.title`)}
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {t(`${key}.failed.description`)}
          </p>

          {failureReason ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {failureReason}
            </p>
          ) : null}

          <Button asChild radius="xl" variant="brand" className="mt-6">
            <Link href={ROADMAP_CHAT_HREF}>{t(`${key}.failed.action`)}</Link>
          </Button>
        </div>
      </GlassCard>
    );

  return (
    <GlassCard className="p-8">
      <div
        className="flex flex-col items-center text-center"
        role="status"
        aria-live="polite"
      >
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <L.Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        </div>

        <h2 className="mt-4 text-xl font-medium">
          {t(`${key}.generating.title`)}
        </h2>

        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {t(`${key}.generating.description`)}
        </p>

        <p className="mt-4 text-xs text-muted-foreground">
          {t(`${key}.generating.step`)}
        </p>
      </div>
    </GlassCard>
  );
};
