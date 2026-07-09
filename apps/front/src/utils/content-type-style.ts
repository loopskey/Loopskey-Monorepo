import { ContentType } from "@/lib/graphql/generated";
import { LucideIcon } from "lucide-react";

import * as R from "lucide-react";

export type TContentTypeKey =
  | "COURSE"
  | "EVENT"
  | "PODCAST"
  | "YOUTUBE"
  | "GENERAL";

export type TContentTypeStyle = {
  cssVar: string;
  labelKey: string;
  dotClass: string;
  icon: LucideIcon;
  softClass: string;
  badgeClass: string;
  solidClass: string;
  key: TContentTypeKey;
  cssVarForeground: string;
};

export const CONTENT_TYPE_STYLE: Record<TContentTypeKey, TContentTypeStyle> = {
  COURSE: {
    key: "COURSE",
    labelKey: "common.contentTypes.COURSE",
    icon: R.BookOpen,
    solidClass: "bg-ct-course text-ct-course-foreground hover:bg-ct-course/90",
    softClass:
      "bg-ct-course/12 text-ct-course border border-ct-course/25 hover:bg-ct-course/20",
    badgeClass: "bg-ct-course/12 text-ct-course border-ct-course/25",
    dotClass: "bg-ct-course",
    cssVar: "var(--ct-course)",
    cssVarForeground: "var(--ct-course-foreground)",
  },
  EVENT: {
    key: "EVENT",
    labelKey: "common.contentTypes.EVENT",
    icon: R.CalendarDays,
    solidClass: "bg-ct-event text-ct-event-foreground hover:bg-ct-event/90",
    softClass:
      "bg-ct-event/12 text-ct-event border border-ct-event/25 hover:bg-ct-event/20",
    badgeClass: "bg-ct-event/12 text-ct-event border-ct-event/25",
    dotClass: "bg-ct-event",
    cssVar: "var(--ct-event)",
    cssVarForeground: "var(--ct-event-foreground)",
  },
  PODCAST: {
    key: "PODCAST",
    labelKey: "common.contentTypes.PODCAST",
    icon: R.Podcast,
    solidClass:
      "bg-ct-podcast text-ct-podcast-foreground hover:bg-ct-podcast/90",
    softClass:
      "bg-ct-podcast/12 text-ct-podcast border border-ct-podcast/25 hover:bg-ct-podcast/20",
    badgeClass: "bg-ct-podcast/12 text-ct-podcast border-ct-podcast/25",
    dotClass: "bg-ct-podcast",
    cssVar: "var(--ct-podcast)",
    cssVarForeground: "var(--ct-podcast-foreground)",
  },
  YOUTUBE: {
    key: "YOUTUBE",
    labelKey: "common.contentTypes.YOUTUBE",
    icon: R.Youtube,
    solidClass:
      "bg-ct-youtube text-ct-youtube-foreground hover:bg-ct-youtube/90",
    softClass:
      "bg-ct-youtube/12 text-ct-youtube border border-ct-youtube/25 hover:bg-ct-youtube/20",
    badgeClass: "bg-ct-youtube/12 text-ct-youtube border-ct-youtube/25",
    dotClass: "bg-ct-youtube",
    cssVar: "var(--ct-youtube)",
    cssVarForeground: "var(--ct-youtube-foreground)",
  },
  GENERAL: {
    key: "GENERAL",
    labelKey: "common.contentTypes.GENERAL",
    icon: R.CalendarClock,
    solidClass: "bg-primary text-primary-foreground hover:bg-primary/90",
    softClass:
      "bg-muted/70 text-muted-foreground border border-border hover:bg-muted",
    badgeClass: "bg-muted/70 text-muted-foreground border-border",
    dotClass: "bg-muted-foreground",
    cssVar: "var(--primary)",
    cssVarForeground: "var(--primary-foreground)",
  },
};

export const getContentTypeStyle = (
  type?: ContentType | string | null,
): TContentTypeStyle => {
  if (!type) return CONTENT_TYPE_STYLE.GENERAL;
  const key = String(type).toUpperCase() as TContentTypeKey;
  return CONTENT_TYPE_STYLE[key] ?? CONTENT_TYPE_STYLE.GENERAL;
};
