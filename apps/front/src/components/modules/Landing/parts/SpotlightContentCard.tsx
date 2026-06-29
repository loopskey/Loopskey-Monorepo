"use client";

import { ArrowRight, BadgeCheck, Sparkles, Star } from "lucide-react";
import { TLandingContentItem } from "@/types/landing-module.types";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

import Image from "next/image";
import Link from "next/link";

const SpotlightContentCard = ({ item }: { item: TLandingContentItem }) => {
  const { t } = useI18n();

  const priceLabel =
    item.isFree || !item.price || Number(item.price) <= 0
      ? t("landing.learningHub.free")
      : `${item.currency ?? "USD"} ${Number(item.price).toFixed(2)}`;

  return (
    <GlassCard className="h-full overflow-hidden p-0">
      <div
        key={`${item.kind}-${item.id}`}
        className="relative z-10 grid h-full animate-in fade-in-0 zoom-in-95 duration-500 lg:grid-rows-[310px_1fr]"
      >
        <div className="relative overflow-hidden bg-muted">
          {item.imageUrl ? (
            <Image
              fill
              priority
              alt={item.title}
              src={item.imageUrl}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 520px"
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.42),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(20,184,166,0.28),transparent_32%),linear-gradient(135deg,rgba(59,130,246,0.18),rgba(20,184,166,0.12))]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/15 to-transparent" />
          <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-background/75 px-4 py-2 text-xs font-medium text-primary shadow-sm backdrop-blur-xl">
            <BadgeCheck className="h-4 w-4" />
            {t("landing.learningHub.spotlight")}
          </div>

          <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-primary/90 px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm">
              {item.kind}
            </span>

            {item.category && (
              <span className="rounded-full bg-background/75 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-xl">
                {item.category}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {item.status && (
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {item.status}
              </span>
            )}

            {item.rating && item.rating > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                {item.rating.toFixed(1)}
                {item.ratingCount ? (
                  <span className="text-muted-foreground">
                    ({item.ratingCount})
                  </span>
                ) : null}
              </span>
            )}
          </div>

          <h3 className="text-2xl font-medium tracking-tight md:text-3xl">
            {item.title}
          </h3>

          {item.description && (
            <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">
              {item.description}
            </p>
          )}

          <div className="mt-6 grid gap-3 rounded-3xl border border-glass-border bg-background/45 p-4 sm:grid-cols-2">
            <div>
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {t("landing.learningHub.info")}
              </p>
              <p className="mt-1 font-medium">{item.metaPrimary}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t("landing.learningHub.price")}
              </p>
              <p className="mt-1 font-medium">
                {item.kind === "course" || item.kind === "event"
                  ? priceLabel
                  : item.metaSecondary}
              </p>
            </div>
          </div>

          <Button
            asChild
            size="lg"
            radius="xl"
            variant="brand"
            className="mt-6"
          >
            <Link href={item.href}>
              {t("landing.learningHub.viewDetails")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </GlassCard>
  );
};

export default SpotlightContentCard;
