"use client";

import { ArrowRight, Star } from "lucide-react";
import { ContentThumbnail } from "@elements/content-thumbnail";
import { LANDING_SHELF_KIND_DOT_CLASS_NAME } from "@/utils/landing-shelf.constant";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import Link from "@elements/localized-link";

import type { TLearningShelfStageProps } from "@/types/landing-module.types";

const formatShelfNumber = (index: number) => String(index + 1).padStart(2, "0");

const LearningShelfStage = ({ item, index }: TLearningShelfStageProps) => {
  const { t } = useI18n();

  const isPriced = item.kind === "course" || item.kind === "event";
  const rating = item.rating ?? 0;
  const hasRating = rating > 0;

  const priceLabel =
    item.isFree || !item.price || Number(item.price) <= 0
      ? t("landing.learningHub.free")
      : `${item.currency ?? "USD"} ${Number(item.price).toFixed(2)}`;

  return (
    <div className="flex h-[30.5rem] flex-col md:h-[26rem] md:flex-row xl:h-[27.5rem]">
      <div className="relative h-44 shrink-0 overflow-hidden bg-muted md:h-auto md:w-[44%]">
        <ContentThumbnail
          kind={item.kind}
          title={item.title}
          imageUrl={item.imageUrl}
          category={item.categoryKey}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 340px, 420px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <span className="absolute left-4 top-4 inline-flex h-8 items-center gap-2 rounded-full bg-background/95 px-3 text-xs font-bold uppercase tracking-wider text-foreground shadow-sm">
          <span
            className={cn(
              "size-2 rounded-full",
              LANDING_SHELF_KIND_DOT_CLASS_NAME[item.kind],
            )}
          />
          {t(`landing.learningHub.kind.${item.kind}`)}
        </span>

        {hasRating ? (
          <span
            aria-label={t("landing.learningHub.shelf.rated", {
              rating: rating.toFixed(1),
            })}
            className="absolute right-4 top-4 inline-flex h-8 items-center gap-1.5 rounded-full bg-background/95 px-3 text-xs font-bold text-foreground shadow-sm"
          >
            <Star
              aria-hidden
              className="size-3.5 fill-yellow-400 text-warning-soft-foreground"
            />
            {rating.toFixed(1)}
            {item.ratingCount ? (
              <span className="font-medium text-muted-foreground">
                ({item.ratingCount})
              </span>
            ) : null}
          </span>
        ) : null}

        <span
          aria-hidden
          className="absolute bottom-1 right-4 font-mono text-7xl font-medium leading-none tracking-tighter text-white md:text-8xl"
        >
          {formatShelfNumber(index)}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-5 md:p-8 xl:px-10">
        <p className="flex flex-wrap items-center gap-x-2 text-xs font-bold uppercase tracking-widest text-primary">
          {item.category ? <span>{item.category}</span> : null}
          {item.category && item.status ? (
            <span aria-hidden className="text-muted-foreground">
              ·
            </span>
          ) : null}
          {item.status ? (
            <span className="text-muted-foreground">{item.status}</span>
          ) : null}
        </p>

        <h3 className="mt-3 line-clamp-3 text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
          {item.title}
        </h3>

        {item.description ? (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground md:line-clamp-3 md:text-base md:leading-7">
            {item.description}
          </p>
        ) : null}

        <dl className="mt-auto grid grid-cols-2 gap-4 border-t pt-4">
          <div className="min-w-0">
            <dt className="text-xs font-semibold text-muted-foreground">
              {t("landing.learningHub.info")}
            </dt>
            <dd className="mt-1 truncate text-sm font-bold text-foreground md:text-base">
              {item.metaPrimary}
            </dd>
          </div>

          <div className="min-w-0">
            <dt className="text-xs font-semibold text-muted-foreground">
              {isPriced
                ? t("landing.learningHub.price")
                : t("landing.learningHub.details")}
            </dt>
            <dd className="mt-1 truncate text-sm font-bold text-foreground md:text-base">
              {isPriced ? priceLabel : item.metaSecondary}
            </dd>
          </div>
        </dl>

        <Button asChild size="lg" radius="xl" className="mt-4 w-full md:w-fit">
          <Link href={item.href}>
            {t("landing.learningHub.viewDetails")}
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default LearningShelfStage;
