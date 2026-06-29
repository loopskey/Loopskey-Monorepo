"use client";

import { Headphones, PlayCircle, Star } from "lucide-react";
import { ArrowRight, CalendarDays } from "lucide-react";
import { TLandingContentItem } from "@/types/landing-module.types";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import Image from "next/image";
import Link from "next/link";

const getKindIcon = (kind: TLandingContentItem["kind"]) => {
  if (kind === "event") return <CalendarDays className="h-4 w-4" />;
  if (kind === "podcast") return <Headphones className="h-4 w-4" />;
  if (kind === "youtube") return <PlayCircle className="h-4 w-4" />;
  return <PlayCircle className="h-4 w-4" />;
};

const LandingContentCard = ({ item }: { item: TLandingContentItem }) => {
  const priceLabel =
    item.isFree || !item.price || Number(item.price) <= 0
      ? "Free"
      : `${item.currency ?? "USD"} ${Number(item.price).toFixed(2)}`;

  return (
    <article
      className={cn(
        "group relative h-full overflow-hidden rounded-[1.75rem]",
        "border border-glass-border bg-background/60 shadow-sm backdrop-blur-xl",
        "transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_70px_rgba(37,99,235,0.18)]",
      )}
    >
      <div className="relative h-44 overflow-hidden bg-muted">
        {item.imageUrl ? (
          <Image
            fill
            sizes="320px"
            alt={item.title}
            src={item.imageUrl}
            className="object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_25%_20%,rgba(59,130,246,0.35),transparent_35%),linear-gradient(135deg,rgba(59,130,246,0.16),rgba(20,184,166,0.14))]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />

        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-background/70 px-3 py-2 text-xs font-medium text-primary shadow-sm backdrop-blur-xl">
          {getKindIcon(item.kind)}
          {item.kind}
        </div>

        {item.rating && item.rating > 0 && (
          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-background/70 px-3 py-2 text-xs font-medium text-yellow-500 shadow-sm backdrop-blur-xl">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            {item.rating.toFixed(1)}
          </div>
        )}
      </div>

      <div className="relative z-10 flex min-h-[230px] flex-col p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          {item.category && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {item.category}
            </span>
          )}

          {item.status && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {item.status}
            </span>
          )}
        </div>

        <h3 className="line-clamp-2 text-lg font-medium tracking-tight">
          {item.title}
        </h3>

        {item.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {item.description}
          </p>
        )}

        <div className="mt-auto pt-5">
          <div className="mb-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="line-clamp-1">{item.metaPrimary}</span>
            <span className="shrink-0 font-medium text-foreground">
              {item.kind === "course" || item.kind === "event"
                ? priceLabel
                : item.metaSecondary}
            </span>
          </div>

          <Button asChild variant="brandSoft" radius="xl" className="w-full">
            <Link href={item.href}>
              View details
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
};

export default LandingContentCard;
