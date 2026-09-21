"use client";

import { TContentCardKind } from "@/types/content-module.types";
import { TContentCardProps } from "@/types/content-module.types";
import { ContentThumbnail } from "@elements/content-thumbnail";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import Link from "next/link";

import * as L from "lucide-react";

const KIND_DOT_CLASS_NAME: Record<TContentCardKind, string> = {
  course: "bg-ct-course",
  event: "bg-ct-event",
  podcast: "bg-ct-podcast",
  youtube: "bg-ct-youtube",
};

const KIND_META_ICONS = {
  course: { primary: L.Users, secondary: L.Clock3 },
  event: { primary: L.Users, secondary: L.CalendarDays },
  podcast: { primary: L.Headphones, secondary: L.ListMusic },
  youtube: { primary: L.Users, secondary: L.Video },
} as const;

const ContentCard = ({ item, className }: TContentCardProps) => {
  const { t } = useI18n();

  const { primary: PrimaryIcon, secondary: SecondaryIcon } =
    KIND_META_ICONS[item.kind];
  const hasRating = typeof item.rating === "number" && item.rating > 0;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm",
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        "has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring",
        className,
      )}
    >
      <div className="flex flex-1 gap-3 p-3 sm:flex-col sm:gap-0 sm:p-0">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:aspect-video sm:size-auto sm:rounded-none">
          <ContentThumbnail
            id={item.id}
            kind={item.kind}
            title={item.title}
            imageUrl={item.imageUrl}
            category={item.categoryCode}
            sizes="(max-width: 640px) 96px, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
          />

          {hasRating && (
            <div className="absolute right-2.5 top-2.5 hidden items-center gap-1 rounded-full bg-background/85 px-2.5 py-0.5 text-xs font-bold backdrop-blur sm:flex">
              <L.Star className="size-3 fill-yellow-400 text-yellow-500" />
              {item.rating?.toFixed(1)}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:p-4">
          <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            {item.category && (
              <span className="flex min-w-0 items-center gap-1.5">
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    KIND_DOT_CLASS_NAME[item.kind],
                  )}
                />
                <span className="truncate">{item.category}</span>
              </span>
            )}

            {item.status && (
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold normal-case tracking-normal">
                {item.status}
              </span>
            )}
          </div>

          <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight sm:min-h-11">
            {item.title}
          </h3>

          <p className="hidden min-h-5 text-[13px] leading-5 text-muted-foreground sm:line-clamp-1">
            {item.description}
          </p>

          <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-muted-foreground">
            {hasRating && (
              <span className="flex items-center gap-1 font-bold text-foreground sm:hidden">
                <L.Star className="size-3 fill-yellow-400 text-yellow-500" />
                {item.rating?.toFixed(1)}
              </span>
            )}

            {item.metaPrimary && (
              <span className="flex min-w-0 items-center gap-1.5">
                <PrimaryIcon className="size-3.5 shrink-0 text-primary" />
                <span className="truncate">{item.metaPrimary}</span>
              </span>
            )}

            {item.metaSecondary && (
              <span className="flex min-w-0 items-center gap-1.5">
                <SecondaryIcon className="size-3.5 shrink-0 text-primary" />
                <span className="truncate">{item.metaSecondary}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-3 pb-3 sm:mt-auto sm:border-t sm:px-4 sm:py-3">
        <Button
          asChild
          size="sm"
          radius="lg"
          variant="outline"
          className="w-full text-sm hover:border-primary hover:bg-primary hover:text-primary-foreground group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
        >
          <Link
            href={item.href}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {t("content.card.viewDetails")}
            <L.ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" />
          </Link>
        </Button>
      </div>
    </article>
  );
};

export default ContentCard;
