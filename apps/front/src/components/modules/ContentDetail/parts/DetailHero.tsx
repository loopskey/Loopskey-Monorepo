"use client";

import { TDetailHeroProps } from "@/types/content-module.types";
import { isValidImageSrc } from "@/utils/function-helper";
import { ArrowLeft, Heart, Loader2, Star } from "lucide-react";
import { GlassCard } from "@elements/glass-card";
import { useRouter } from "next/navigation";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import Image from "next/image";

const DetailHero = ({
  title,
  badge,
  rating,
  category,
  imageUrl,
  children,
  wishlist,
  ratingCount,
  description,
  calendarSlot,
}: TDetailHeroProps) => {
  const { t } = useI18n();
  const router = useRouter();

  const validImageUrl = isValidImageSrc(imageUrl) ? imageUrl!.trim() : null;

  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="relative z-10 grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-center p-6 md:p-8 lg:p-10">
          <Button
            radius="xl"
            type="button"
            variant="glass"
            className="mb-6 w-fit"
            onClick={() => router.push("/content")}
          >
            <ArrowLeft className="h-4 w-4" />
            {t("contentDetails.common.backToContent")}
          </Button>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-4 py-2 text-xs font-extrabold text-primary">
              {badge}
            </span>

            {category && (
              <span className="rounded-full bg-muted/70 px-4 py-2 text-xs font-bold text-muted-foreground">
                {category}
              </span>
            )}

            {typeof rating === "number" && rating > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-4 py-2 text-xs font-extrabold text-yellow-600 dark:text-yellow-400">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                {rating.toFixed(1)}
                {typeof ratingCount === "number" && (
                  <span className="text-muted-foreground">({ratingCount})</span>
                )}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl lg:text-3xl">
            {title}
          </h1>

          {description && (
            <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              {description}
            </p>
          )}

          {children && <div className="mt-7">{children}</div>}
        </div>

        <div className="relative min-h-[300px] overflow-hidden bg-muted lg:min-h-[520px]">
          {validImageUrl ? (
            <Image
              fill
              priority
              src={validImageUrl}
              className="object-cover"
              alt={title || "Content detail image"}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.35),transparent_36%),linear-gradient(135deg,rgba(59,130,246,0.16),rgba(20,184,166,0.12))]" />
          )}

          <div
            className={cn(
              "absolute inset-0",
              "bg-gradient-to-t from-background/85 via-background/10 to-transparent lg:bg-gradient-to-r lg:from-background/20 lg:to-transparent",
            )}
          />

          {(calendarSlot || wishlist) && (
            <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
              {calendarSlot}
              {wishlist && (
                <Button
                  size="icon"
                  radius="full"
                  type="button"
                  variant="glass"
                  onClick={wishlist.onToggle}
                  disabled={wishlist.loading}
                  aria-label={
                    wishlist.isWishlisted
                      ? t("contentDetails.actions.saved")
                      : t("contentDetails.actions.addWishlist")
                  }
                  title={
                    wishlist.isWishlisted
                      ? t("contentDetails.actions.saved")
                      : t("contentDetails.actions.addWishlist")
                  }
                >
                  {wishlist.loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        wishlist.isWishlisted && "fill-current text-primary",
                      )}
                    />
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default DetailHero;
