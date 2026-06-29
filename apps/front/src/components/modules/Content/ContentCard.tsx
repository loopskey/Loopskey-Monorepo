"use client";

import { TContentCardProps } from "@/types/content-module.types";
import { isValidImageSrc } from "@/utils/function-helper";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import Image from "next/image";
import Link from "next/link";

import * as L from "lucide-react";

const kindIcon = {
  course: L.Clock3,
  event: L.CalendarDays,
  podcast: L.Headphones,
  youtube: L.PlayCircle,
};

const ContentCard = ({ item, className }: TContentCardProps) => {
  const { t } = useI18n();

  const Icon = kindIcon[item.kind] ?? L.BookOpen;
  const hasValidImage = isValidImageSrc(item.imageUrl);

  return (
    <GlassCard
      glow
      className={cn(
        "group overflow-hidden p-0",
        "transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_90px_rgba(37,99,235,0.18)]",
        className,
      )}
    >
      <div className="relative z-10">
        <div className="relative h-48 overflow-hidden rounded-t-[2rem] bg-muted">
          {hasValidImage ? (
            <Image
              fill
              alt={item.title || "Content image"}
              src={item.imageUrl!.trim()}
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.25),transparent_35%),linear-gradient(135deg,rgba(59,130,246,0.16),rgba(20,184,166,0.10))]">
              <Icon className="h-12 w-12 text-primary/70" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />

          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/30 bg-background/55 px-3 py-1 text-xs font-bold backdrop-blur-xl">
            <Icon className="h-3.5 w-3.5 text-primary" />
            {t(`content.tabs.${item.kind}`)}
          </div>

          {typeof item.rating === "number" && (
            <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-white/30 bg-background/55 px-3 py-1 text-xs font-bold backdrop-blur-xl">
              <L.Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              {item.rating.toFixed(1)}
            </div>
          )}
        </div>

        <div className="space-y-4 py-5">
          <div className="flex flex-wrap items-center justify-between">
            {item.category && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {item.category}
              </span>
            )}

            {item.status && (
              <span className="rounded-full bg-muted/70 px-3 py-1 text-xs font-semibold text-muted-foreground">
                {item.status}
              </span>
            )}
          </div>

          <div>
            <h3 className="line-clamp-2 text-lg font-medium tracking-tight">
              {item.title}
            </h3>

            {item.description && (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            {item.metaPrimary && (
              <div className="flex items-center gap-2 rounded-2xl bg-background/45 px-3 py-2">
                <L.Users className="h-4 w-4 text-primary" />
                <span className="truncate">{item.metaPrimary}</span>
              </div>
            )}

            {item.metaSecondary && (
              <div className="flex items-center gap-2 rounded-2xl bg-background/45 px-3 py-2">
                <L.Clock3 className="h-4 w-4 text-primary" />
                <span className="truncate">{item.metaSecondary}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="text-sm font-medium">
              {item.isFree
                ? t("content.card.free")
                : typeof item.price === "number"
                  ? `$${item.price}`
                  : ""}
            </div>

            <Button asChild variant="brandSoft" radius="xl">
              <Link href={item.href}>
                {t("content.card.viewDetails")}
                <L.ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default ContentCard;
