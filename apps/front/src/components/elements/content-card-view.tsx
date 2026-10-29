import { ContentThumbnail } from "@elements/content-thumbnail";
import { cn } from "@/lib/utils";

import type { TContentCardProps } from "@/types/content-module.types";
import type { TContentCardKind } from "@/types/content-module.types";

import Link from "next/link";

import * as L from "lucide-react";

const KIND_DOT_CLASS_NAME: Record<TContentCardKind, string> = {
  course: "bg-ct-course",
  event: "bg-ct-event",
  podcast: "bg-ct-podcast",
  youtube: "bg-ct-youtube",
};

const KIND_CTA_CLASS_NAME: Record<TContentCardKind, string> = {
  course: "bg-ct-course text-ct-course-foreground",
  event: "bg-ct-event text-ct-event-foreground",
  podcast: "bg-ct-podcast text-ct-podcast-foreground",
  youtube: "bg-ct-youtube text-ct-youtube-foreground",
};

const KIND_META_ICONS = {
  course: { primary: L.Users, secondary: L.Clock3 },
  event: { primary: L.Users, secondary: L.CalendarDays },
  podcast: { primary: L.Headphones, secondary: L.ListMusic },
  youtube: { primary: L.Users, secondary: L.Video },
} as const;

const CTA_CLASS_NAME =
  "flex min-h-12 items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold shadow-sm";

export type ContentCardViewProps = TContentCardProps & {
  viewDetails: string;
  originalLanguage: string;
};

const ContentCardView = ({
  item,
  overlay,
  className,
  footerNote,
  viewDetails,
  originalLanguage,
}: ContentCardViewProps) => {
  const { primary: PrimaryIcon, secondary: SecondaryIcon } =
    KIND_META_ICONS[item.kind];
  const hasRating = typeof item.rating === "number" && item.rating > 0;

  return (
    <article
      className={cn(
        "group @container relative isolate flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground",
        "transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-xl",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        "has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-offset-2",
        "has-[a:active]:scale-[0.985] motion-reduce:has-[a:active]:scale-100",
        className,
      )}
    >
      <div className="relative aspect-video w-full shrink-0 border-b bg-white">
        <ContentThumbnail
          title={item.title}
          imageUrl={item.imageUrl}
          category={item.categoryKey}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-5 @max-[17rem]:p-4">
        {item.category || hasRating || overlay ? (
          <div className="flex items-center justify-between gap-2">
            {item.category ? (
              <span className="flex min-w-0 items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide">
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    KIND_DOT_CLASS_NAME[item.kind],
                  )}
                />
                <span className="truncate">{item.category}</span>
              </span>
            ) : null}

            <div className="relative z-10 ml-auto flex shrink-0 items-center gap-2">
              {hasRating ? (
                <span className="flex items-center gap-1 text-xs font-bold">
                  <L.Star
                    aria-hidden="true"
                    className="size-3.5 fill-yellow-400 text-yellow-500"
                  />
                  {item.rating?.toFixed(1)}
                </span>
              ) : null}

              {overlay}
            </div>
          </div>
        ) : null}

        {item.status ? (
          <span className="w-fit rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground">
            {item.status}
          </span>
        ) : null}

        <h3
          lang={item.contentLang ?? undefined}
          className="line-clamp-2 text-balance text-xl font-semibold leading-tight tracking-tight @max-[17rem]:text-lg"
        >
          {item.title}
        </h3>

        {item.description ? (
          <p
            lang={item.contentLang ?? undefined}
            className="line-clamp-2 text-[13px] leading-5 text-muted-foreground"
          >
            {item.description}
          </p>
        ) : null}

        {item.originalLanguage ? (
          <p className="text-[11px] font-semibold text-muted-foreground">
            {originalLanguage}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1.5 text-xs text-muted-foreground">
          {item.metaPrimary ? (
            <span className="flex min-w-0 items-center gap-1.5">
              <PrimaryIcon aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="truncate">{item.metaPrimary}</span>
            </span>
          ) : null}

          {item.metaSecondary ? (
            <span className="flex min-w-0 items-center gap-1.5">
              <SecondaryIcon aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="truncate">{item.metaSecondary}</span>
            </span>
          ) : null}
        </div>

        {footerNote ? (
          <div className="text-xs text-muted-foreground">{footerNote}</div>
        ) : null}

        <div className="mt-auto pt-2">
          {item.href ? (
            <Link
              href={item.href}
              className={cn(
                CTA_CLASS_NAME,
                "outline-none transition-[filter] group-hover:brightness-110 active:brightness-90 motion-reduce:transition-none after:absolute after:inset-0 after:content-['']",
                KIND_CTA_CLASS_NAME[item.kind],
              )}
            >
              {viewDetails}
              <span className="sr-only">: {item.title}</span>
              <span
                aria-hidden
                className="flex size-7 items-center justify-center rounded-full bg-white/20"
              >
                <L.ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 group-focus-within:translate-x-0.5 motion-reduce:transform-none" />
              </span>
            </Link>
          ) : (
            <span
              className={cn(CTA_CLASS_NAME, "bg-muted text-muted-foreground")}
            >
              {viewDetails}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default ContentCardView;
