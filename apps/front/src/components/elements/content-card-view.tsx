import { ContentThumbnail } from "@elements/content-thumbnail";
import { cn } from "@/lib/utils";

import type { TContentCardLabels } from "@/types/content-module.types";
import type { TContentCardProps } from "@/types/content-module.types";
import type { TContentCardKind } from "@/types/content-module.types";

import Link from "next/link";

import * as L from "lucide-react";

const KIND_ICONS = {
  course: L.GraduationCap,
  event: L.CalendarDays,
  podcast: L.Headphones,
  youtube: L.MonitorPlay,
} as const;

const KIND_TEXT_CLASS_NAME: Record<TContentCardKind, string> = {
  course: "text-ct-course",
  event: "text-ct-event",
  podcast: "text-ct-podcast",
  youtube: "text-ct-youtube",
};

const KIND_META_ICONS = {
  course: { primary: L.Users, secondary: L.Clock3 },
  event: { primary: L.Users, secondary: L.MapPin },
  podcast: { primary: L.Headphones, secondary: L.ListMusic },
  youtube: { primary: L.Users, secondary: L.Video },
} as const;

const LEVEL_BARS: Record<string, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  ALL_LEVELS: 3,
};

const LEVEL_BAR_HEIGHTS = ["h-1", "h-[7px]", "h-2.5"];

const COVER_PILL_CLASS_NAME =
  "inline-flex items-center rounded-full border bg-white/95 shadow-xs";

export type ContentCardViewProps = TContentCardProps & {
  labels: TContentCardLabels;
};

const LevelBars = ({ level }: { level?: string | null }) => {
  const filled = level ? LEVEL_BARS[level] : undefined;
  if (!filled) return null;

  return (
    <span aria-hidden className="flex h-2.5 items-end gap-px">
      {LEVEL_BAR_HEIGHTS.map((height, index) => (
        <span
          key={height}
          className={cn(
            "w-[3px] rounded-[1px]",
            height,
            index < filled ? "bg-primary" : "bg-border",
          )}
        />
      ))}
    </span>
  );
};

const ContentCardView = ({
  item,
  labels,
  overlay,
  className,
  footerNote,
}: ContentCardViewProps) => {
  const KindIcon = KIND_ICONS[item.kind];
  const { primary: PrimaryIcon, secondary: SecondaryIcon } =
    KIND_META_ICONS[item.kind];
  const hasRating = typeof item.rating === "number" && item.rating > 0;
  const hasMeta = hasRating || Boolean(item.metaSecondary);

  return (
    <article
      className={cn(
        "group @container relative isolate flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground",
        "transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_12px_28px_-12px_oklch(0.3351_0.1745_271.87/0.28)]",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        "has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-offset-2",
        "has-[a:active]:scale-[0.985] motion-reduce:has-[a:active]:scale-100",
        className,
      )}
    >
      <div className="relative aspect-video w-full shrink-0 overflow-hidden border-b bg-white">
        <ContentThumbnail category={item.categoryKey} />

        <span
          className={cn(
            COVER_PILL_CLASS_NAME,
            "absolute left-3 top-3 h-6.5 gap-1.5 pl-2 pr-2.5 text-xs font-semibold text-foreground",
          )}
        >
          <KindIcon
            aria-hidden
            className={cn("size-3.5", KIND_TEXT_CLASS_NAME[item.kind])}
          />
          {labels.kind[item.kind]}
        </span>

        {item.dateBadge ? (
          <span className="absolute bottom-2.5 left-2.5 grid min-w-11 justify-items-center gap-0.5 rounded-[10px] bg-primary px-2 py-1 leading-none text-primary-foreground tabular-nums shadow-xs">
            <span className="text-base font-bold">{item.dateBadge.day}</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.08em]">
              {item.dateBadge.month}
            </span>
          </span>
        ) : null}

        {overlay ? (
          <div className="absolute right-2.5 top-2.5 z-10">{overlay}</div>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 px-4 py-3.5 @max-[16rem]:px-3.5">
        {item.category || item.status ? (
          <div className="flex min-w-0 items-center gap-2 text-[11.5px] font-semibold text-muted-foreground">
            {item.category ? (
              <span className="truncate uppercase tracking-[0.06em]">
                {item.category}
              </span>
            ) : null}

            {item.category && item.status ? (
              <span
                aria-hidden
                className="size-[3px] shrink-0 rounded-full bg-current opacity-60"
              />
            ) : null}

            {item.status ? (
              <span className="flex shrink-0 items-center gap-1.5 text-foreground">
                <LevelBars level={item.levelKey} />
                {item.status}
              </span>
            ) : null}
          </div>
        ) : null}

        <h3
          lang={item.contentLang ?? undefined}
          className="line-clamp-2 text-pretty text-base/snug font-semibold tracking-tight @min-[20rem]:text-[17px]"
        >
          {item.title}
        </h3>

        {item.byline ? (
          <p className="truncate text-[13px] text-muted-foreground">
            {item.byline}
          </p>
        ) : null}

        {item.originalLanguage ? (
          <p className="text-[11px] font-semibold text-muted-foreground">
            {labels.originalLanguage}
          </p>
        ) : null}

        {hasMeta ? (
          <div className="mt-auto flex flex-wrap items-center gap-x-3.5 gap-y-1 pt-1 text-[12.5px] text-muted-foreground tabular-nums">
            {hasRating ? (
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <L.Star
                  aria-hidden
                  className="size-3.5 fill-amber-400 text-amber-400"
                />
                {item.rating?.toFixed(1)}
                {item.ratingCount ? (
                  <span className="font-normal text-muted-foreground">
                    ({item.ratingCount})
                  </span>
                ) : null}
              </span>
            ) : null}

            {item.metaSecondary ? (
              <span className="flex min-w-0 items-center gap-1">
                <SecondaryIcon aria-hidden className="size-3.5 shrink-0" />
                <span className="truncate">{item.metaSecondary}</span>
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex min-h-12 items-center justify-between gap-3 border-t px-4 py-2.5 text-[13px] @max-[16rem]:px-3.5">
        <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
          {footerNote ??
            (item.metaPrimary ? (
              <>
                <PrimaryIcon aria-hidden className="size-3.5 shrink-0" />
                <span className="truncate">{item.metaPrimary}</span>
              </>
            ) : null)}
        </span>

        {item.href ? (
          <Link
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 font-semibold outline-none",
              "after:absolute after:inset-0 after:content-['']",
              KIND_TEXT_CLASS_NAME[item.kind],
            )}
          >
            {labels.cta[item.kind]}
            <span className="sr-only">: {item.title}</span>
            <L.ArrowRight
              aria-hidden
              className="size-[15px] transition-transform group-hover:translate-x-0.5 group-focus-within:translate-x-0.5 motion-reduce:transform-none"
            />
          </Link>
        ) : (
          <span className="shrink-0 font-semibold text-muted-foreground">
            {labels.cta[item.kind]}
          </span>
        )}
      </div>
    </article>
  );
};

export default ContentCardView;
