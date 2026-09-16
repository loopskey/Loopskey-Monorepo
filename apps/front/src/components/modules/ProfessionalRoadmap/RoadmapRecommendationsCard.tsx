"use client";

import { Recommendation } from "@/types/professional-roadmap-chat.types";
import { GlassCard } from "@elements/glass-card";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

type TRoadmapRecommendationsCardProps = {
  className?: string;
  recommendations: Recommendation[];
  t: (key: string, values?: Record<string, string | number>) => string;
};

export const RoadmapRecommendationsCard = ({
  t,
  className,
  recommendations,
}: TRoadmapRecommendationsCardProps) => {
  const key = "professionalDashboard.roadmap";

  if (recommendations.length === 0) return null;

  return (
    <GlassCard className={className ?? "p-5"}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t(`${key}.recommended`)}
        </h3>
        <L.Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
      </div>

      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        {t(`${key}.recommendedDescription`)}
      </p>

      <ul className="mt-4 space-y-3">
        {recommendations.map((item) => (
          <li
            key={`${item.contentType}:${item.contentId}`}
            className="rounded-md border p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium">{item.title}</p>
              {item.isFree ? (
                <Badge variant="secondary">{t(`${key}.free`)}</Badge>
              ) : null}
            </div>

            <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>{item.contentType}</span>
              {item.durationMinutes ? (
                <span>
                  {t(`${key}.minutes`, { count: item.durationMinutes })}
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
};
