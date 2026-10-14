"use client";

import { RoadmapStepMeta } from "@modules/ProfessionalRoadmap/RoadmapStepMeta";
import { useI18n } from "@/hooks/useI18n";

import type { RoadmapRecommendationsListProps } from "@/types/professional-roadmap-chat.types";

const KEY = "professionalDashboard.roadmap";

export const RoadmapRecommendationsList = ({
  recommendations,
}: RoadmapRecommendationsListProps) => {
  const { t } = useI18n();

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {t(`${KEY}.recommendedDescription`)}
      </p>

      <ul className="overflow-hidden rounded-lg border">
        {recommendations.map((item) => (
          <li
            key={`${item.contentType}:${item.contentId}`}
            className="space-y-0.5 border-b px-3 py-2.5 last:border-b-0"
          >
            <p className="text-sm font-medium break-words">{item.title}</p>

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
          </li>
        ))}
      </ul>
    </div>
  );
};
