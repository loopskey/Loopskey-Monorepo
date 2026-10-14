"use client";

import { formatDurationMinutes } from "@/utils/content-source.helper";
import { translateWithFallback } from "@/utils/function-helper";
import { humanizeEnumValue } from "@/utils/function-helper";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

import type { RoadmapStepMetaProps } from "@/types/professional-roadmap-chat.types";

const CONTENT_TYPE_DOT_CLASS_NAME: Record<string, string> = {
  COURSE: "bg-ct-course",
  EVENT: "bg-ct-event",
  PODCAST: "bg-ct-podcast",
  YOUTUBE: "bg-ct-youtube",
};

export const RoadmapStepMeta = ({
  credits,
  children,
  contentType,
  estimatedMinutes,
}: RoadmapStepMetaProps) => {
  const { t } = useI18n();
  const duration = formatDurationMinutes(estimatedMinutes);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {contentType ? (
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden
            className={cn(
              "size-2 rounded-full",
              CONTENT_TYPE_DOT_CLASS_NAME[contentType] ?? "bg-muted-foreground",
            )}
          />
          {translateWithFallback(
            t,
            `common.contentTypes.${contentType}`,
            humanizeEnumValue(contentType),
          )}
        </span>
      ) : null}

      {duration ? <span className="tabular-nums">{duration}</span> : null}

      {typeof credits === "number" ? (
        <span className="tabular-nums">
          {t("professionalDashboard.roadmap.pduValue", { count: credits })}
        </span>
      ) : null}

      {children}
    </div>
  );
};
