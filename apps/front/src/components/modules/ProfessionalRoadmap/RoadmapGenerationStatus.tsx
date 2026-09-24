"use client";

import { RoadmapGenerationFailureCode } from "@/lib/graphql/base";
import { TRoadmapStatusProps } from "@/types/professional-roadmap-chat.types";
import { RoadmapDraftStatus } from "@/lib/graphql/base";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import Link from "next/link";

import * as L from "lucide-react";

const ROADMAP_CHAT_HREF = "/dashboard/professional/roadmap-chat";

export const RoadmapGenerationStatus = ({
  t,
  goal,
  status,
  failure,
  draftId,
  onRetry,
  isRetrying,
}: TRoadmapStatusProps) => {
  const key = "professionalDashboard.roadmap";
  const reviewHref = `${ROADMAP_CHAT_HREF}?draftId=${encodeURIComponent(draftId)}`;
  const reviewPreferencesHref = `${reviewHref}&focus=preferences`;

  if (status === RoadmapDraftStatus.Failed) {
    const isNoContent =
      failure?.code === RoadmapGenerationFailureCode.NoMatchingContent;

    return (
      <GlassCard className="p-8">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-md bg-destructive/10 p-3 text-destructive">
            <L.AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>

          <h2 className="mt-4 text-xl font-medium">
            {isNoContent
              ? t(`${key}.noContent.title`)
              : t(`${key}.genericFailure.title`)}
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {isNoContent
              ? t(`${key}.noContent.description`)
              : t(`${key}.genericFailure.description`)}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {isNoContent ? (
              <Button asChild radius="xl">
                <Link href={reviewPreferencesHref}>
                  {t(`${key}.noContent.action`)}
                </Link>
              </Button>
            ) : (
              <Button radius="xl" disabled={isRetrying} onClick={onRetry}>
                {isRetrying ? (
                  <L.Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                {t(`${key}.genericFailure.action`)}
              </Button>
            )}

            <Button asChild radius="xl" variant="outline">
              <Link href={reviewHref}>
                {isNoContent
                  ? t(`${key}.noContent.startOver`)
                  : t(`${key}.genericFailure.reviewBrief`)}
              </Link>
            </Button>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-8">
      <div
        className="flex flex-col items-center text-center"
        role="status"
        aria-live="polite"
      >
        <div className="rounded-md bg-primary/10 p-3 text-primary">
          <L.Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        </div>

        <h2 className="mt-4 text-xl font-medium">
          {t(`${key}.generating.title`)}
        </h2>

        {goal ? (
          <p className="mt-1 max-w-md text-sm font-medium">{goal}</p>
        ) : null}

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
