"use client";

import { ContentThumbnail } from "@elements/content-thumbnail";
import { useI18n } from "@/hooks/useI18n";
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

const KIND_CTA_HOVER_CLASS_NAME: Record<TContentCardKind, string> = {
  course: "group-hover:bg-ct-course group-hover:text-ct-course-foreground",
  event: "group-hover:bg-ct-event group-hover:text-ct-event-foreground",
  podcast: "group-hover:bg-ct-podcast group-hover:text-ct-podcast-foreground",
  youtube: "group-hover:bg-ct-youtube group-hover:text-ct-youtube-foreground",
};

const KIND_META_ICONS = {
  course: { primary: L.Users, secondary: L.Clock3 },
  event: { primary: L.Users, secondary: L.CalendarDays },
  podcast: { primary: L.Headphones, secondary: L.ListMusic },
  youtube: { primary: L.Users, secondary: L.Video },
} as const;

const PROGRESSIVE_BLUR_LAYER_CLASS_NAMES = [
  "backdrop-blur-[2px] [mask-image:linear-gradient(to_bottom,transparent_0%,black_25%)]",
  "backdrop-blur-[4px] [mask-image:linear-gradient(to_bottom,transparent_20%,black_45%)]",
  "backdrop-blur-[8px] [mask-image:linear-gradient(to_bottom,transparent_40%,black_65%)]",
  "backdrop-blur-[16px] [mask-image:linear-gradient(to_bottom,transparent_60%,black_85%)]",
] as const;

const CHIP_CLASS_NAME =
  "flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1 text-[11px] font-bold backdrop-blur-md";

const CTA_CLASS_NAME =
  "flex h-14 w-full items-center justify-center gap-2 bg-background text-[15px] font-semibold text-foreground";

const ContentCard = ({
  item,
  overlay,
  className,
  footerNote,
}: TContentCardProps) => {
  const { t } = useI18n();
  const { primary: PrimaryIcon, secondary: SecondaryIcon } =
    KIND_META_ICONS[item.kind];
  const hasRating = typeof item.rating === "number" && item.rating > 0;

  return (
    <article
      className={cn(
        "group relative isolate flex aspect-[3/4] min-h-[27.5rem] min-w-0 flex-col justify-end overflow-hidden rounded-2xl text-white",
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        "has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-offset-2",
        className,
      )}
    >
      <ContentThumbnail
        kind={item.kind}
        title={item.title}
        imageUrl={item.imageUrl}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        className="-z-30 transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-20 h-[72%] bg-gradient-to-t from-black/95 via-black/75 to-transparent"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[62%]"
      >
        {PROGRESSIVE_BLUR_LAYER_CLASS_NAMES.map((layerClassName) => (
          <div
            key={layerClassName}
            className={cn("absolute inset-0", layerClassName)}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-6 top-6 z-10 flex items-center justify-between gap-2">
        {item.category ? (
          <span
            className={cn(CHIP_CLASS_NAME, "min-w-0 uppercase tracking-wide")}
          >
            <span
              className={cn(
                "size-2 shrink-0 rounded-full ring-2 ring-white/35",
                KIND_DOT_CLASS_NAME[item.kind],
              )}
            />
            <span className="truncate">{item.category}</span>
          </span>
        ) : null}

        <div className="pointer-events-auto ml-auto flex shrink-0 items-center gap-2">
          {hasRating ? (
            <span className={CHIP_CLASS_NAME}>
              <L.Star className="size-3 fill-yellow-400 text-yellow-500" />
              {item.rating?.toFixed(1)}
            </span>
          ) : null}

          {overlay}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-2 px-6 pb-5">
        {item.status ? (
          <span className="w-fit rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-black">
            {item.status}
          </span>
        ) : null}

        <h3
          lang={item.contentLang ?? undefined}
          className="line-clamp-2 text-balance text-xl font-semibold leading-tight tracking-tight"
        >
          {item.title}
        </h3>

        {item.description ? (
          <p
            lang={item.contentLang ?? undefined}
            className="line-clamp-2 text-[13px] leading-5"
          >
            {item.description}
          </p>
        ) : null}

        {item.originalLanguage ? (
          <p className="text-[11px] font-semibold">
            {t("content.card.originalLanguage")}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1.5 text-xs">
          {item.metaPrimary ? (
            <span className="flex min-w-0 items-center gap-1.5">
              <PrimaryIcon className="size-3.5 shrink-0" />
              <span className="truncate">{item.metaPrimary}</span>
            </span>
          ) : null}

          {item.metaSecondary ? (
            <span className="flex min-w-0 items-center gap-1.5">
              <SecondaryIcon className="size-3.5 shrink-0" />
              <span className="truncate">{item.metaSecondary}</span>
            </span>
          ) : null}
        </div>

        {footerNote ? <div className="text-xs">{footerNote}</div> : null}
      </div>

      {item.href ? (
        <Link
          href={item.href}
          className={cn(
            CTA_CLASS_NAME,
            "transition-colors after:absolute after:inset-0 after:content-['']",
            KIND_CTA_HOVER_CLASS_NAME[item.kind],
          )}
        >
          {t("content.card.viewDetails")}
          <span className="sr-only">: {item.title}</span>
          <L.ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" />
        </Link>
      ) : (
        <span aria-disabled className={cn(CTA_CLASS_NAME, "opacity-60")}>
          {t("content.card.viewDetails")}
        </span>
      )}
    </article>
  );
};

export default ContentCard;
