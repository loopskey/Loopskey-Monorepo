"use client";

import { Headphones, PlayCircle, Star } from "lucide-react";
import { ArrowRight, CalendarDays } from "lucide-react";
import { TLandingHeroResultItem } from "@/types/landing-module.types";
import { ContentThumbnail } from "@elements/content-thumbnail";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

import Link from "next/link";

const getIcon = (kind: TLandingHeroResultItem["kind"]) => {
  if (kind === "event") return <CalendarDays className="h-3.5 w-3.5" />;
  if (kind === "podcast") return <Headphones className="h-3.5 w-3.5" />;
  return <PlayCircle className="h-3.5 w-3.5" />;
};

const HeroMiniResultCard = ({ item }: { item: TLandingHeroResultItem }) => {
  const { t } = useI18n();

  return (
    <Link
      href={item.href}
      className={cn(
        "group block rounded-lg border p-3 shadow-sm",
        "transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:bg-muted hover:shadow-[0_18px_50px_rgba(37,99,235,0.16)]",
      )}
    >
      <div className="flex gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
          <ContentThumbnail
            sizes="64px"
            id={item.id}
            kind={item.kind}
            title={item.title}
            imageUrl={item.imageUrl}
            category={item.category}
            className="transition duration-500 group-hover:scale-110"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
              {getIcon(item.kind)}
              {item.kind}
            </span>

            {item.rating && item.rating > 0 ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-warning-soft-foreground">
                <Star className="h-3 w-3 fill-yellow-400 text-warning-soft-foreground" />
                {item.rating.toFixed(1)}
              </span>
            ) : null}
          </div>

          <h3 className="line-clamp-1 text-sm font-medium tracking-tight">
            {item.title}
          </h3>

          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            {item.meta ?? item.category}
          </p>

          <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
            {t("landing.hero.viewItem")}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HeroMiniResultCard;
