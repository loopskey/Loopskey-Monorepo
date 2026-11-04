"use client";

import { roadmapContentHref } from "@/utils/roadmap-navigation.util";
import { RoadmapStepMeta } from "@modules/ProfessionalRoadmap/RoadmapStepMeta";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

import type { TRoadmapRecommendationsCardProps } from "@/types/professional-roadmap-chat.types";

import Link from "next/link";

import * as L from "lucide-react";

const KEY = "professionalDashboard.roadmap";

const PREVIEW_COUNT = 3;

export const RoadmapRecommendationsCard = ({
  recommendations,
}: TRoadmapRecommendationsCardProps) => {
  const { t } = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);

  if (recommendations.length === 0) return null;

  const visible = isExpanded
    ? recommendations
    : recommendations.slice(0, PREVIEW_COUNT);
  const canExpand = recommendations.length > PREVIEW_COUNT;

  return (
    <section
      aria-labelledby="roadmap-recommended-title"
      className="space-y-2 rounded-2xl border p-4"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id="roadmap-recommended-title"
          className="font-semibold text-foreground"
        >
          {t(`${KEY}.recommendedCard.title`)}
        </h2>
        <span className="text-xs tabular-nums text-muted-foreground">
          {recommendations.length}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        {t(`${KEY}.recommendedCard.description`)}
      </p>

      <ul>
        {visible.map((item) => {
          const href = roadmapContentHref(item.contentType, item.contentSlug);
          const body = (
            <>
              <span className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {item.title}
                </span>
                {href ? (
                  <L.ArrowUpRight
                    aria-hidden
                    className="mt-0.5 size-4 shrink-0 text-primary"
                  />
                ) : null}
              </span>
              <RoadmapStepMeta
                credits={item.credits}
                contentType={item.contentType}
                estimatedMinutes={item.durationMinutes}
              >
                {item.isFree ? (
                  <span className="rounded-full bg-accent px-2 py-px text-[11px] font-semibold text-accent-foreground">
                    {t(`${KEY}.free`)}
                  </span>
                ) : null}
              </RoadmapStepMeta>
            </>
          );

          return (
            <li
              key={`${item.contentType}:${item.contentId}`}
              className="border-t first:border-t-0"
            >
              {href ? (
                <Link
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="-mx-2 block space-y-1 rounded-lg px-2 py-2.5 outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {body}
                </Link>
              ) : (
                <div className="space-y-1 py-2.5">{body}</div>
              )}
            </li>
          );
        })}
      </ul>

      {canExpand ? (
        <Button
          type="button"
          variant="outline"
          aria-expanded={isExpanded}
          className="w-full text-primary"
          onClick={() => setIsExpanded((current) => !current)}
        >
          {isExpanded
            ? t(`${KEY}.recommendedCard.showFewer`)
            : t(`${KEY}.recommendedCard.seeAll`, {
                count: recommendations.length,
              })}
        </Button>
      ) : null}
    </section>
  );
};
