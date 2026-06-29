import { ArrowRight, Star } from "lucide-react";
import { TLandingSlider } from "@/types/landing-module.types";
import { getKindIcon } from "./LandingContentCarousel";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import Image from "next/image";
import Link from "next/link";

const LandingSliderCard = ({ item, isActive, onHover }: TLandingSlider) => {
  const { t } = useI18n();

  const priceLabel =
    item.isFree || !item.price || Number(item.price) <= 0
      ? t("landing.learningHub.free")
      : `${item.currency ?? "USD"} ${Number(item.price).toFixed(2)}`;

  return (
    <article
      tabIndex={0}
      onMouseEnter={onHover}
      onFocus={onHover}
      className={cn(
        "group relative h-full overflow-hidden rounded-[1.8rem]",
        "border border-glass-border bg-background/70 shadow-sm backdrop-blur-2xl",
        "transition-all duration-500 ease-out",
        "hover:-translate-y-2 hover:border-primary/45 hover:shadow-[0_26px_80px_rgba(37,99,235,0.22)]",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
        isActive &&
          "border-primary/50 shadow-[0_26px_80px_rgba(37,99,235,0.24)]",
      )}
    >
      <div className="relative h-48 overflow-hidden bg-muted">
        {item.imageUrl ? (
          <Image
            fill
            alt={item.title}
            src={item.imageUrl}
            sizes="(max-width: 640px) 86vw, (max-width: 1024px) 46vw, 320px"
            className="object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_25%_20%,rgba(59,130,246,0.35),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(20,184,166,0.22),transparent_34%),linear-gradient(135deg,rgba(59,130,246,0.18),rgba(20,184,166,0.14))]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-background/75 px-3 py-2 text-xs font-medium uppercase tracking-wide text-primary shadow-sm backdrop-blur-xl">
          {getKindIcon(item.kind)}
          {item.kind}
        </div>

        {item.rating && item.rating > 0 ? (
          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-background/75 px-3 py-2 text-xs font-medium text-yellow-500 shadow-sm backdrop-blur-xl">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            {item.rating.toFixed(1)}
          </div>
        ) : null}

        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
          {item.category ? (
            <span className="rounded-full bg-primary/90 px-3 py-1.5 text-xs font-medium text-primary-foreground">
              {item.category}
            </span>
          ) : null}

          {item.status ? (
            <span className="rounded-full bg-background/75 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-xl">
              {item.status}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex min-h-[250px] flex-col p-5">
        <h3 className="line-clamp-2 text-lg font-medium leading-6 tracking-tight">
          {item.title}
        </h3>

        {item.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {item.description}
          </p>
        ) : null}

        <div className="mt-4 grid gap-3 rounded-2xl border border-glass-border bg-background/45 p-3">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="line-clamp-1 text-muted-foreground">
              {item.metaPrimary}
            </span>

            <span className="shrink-0 font-medium text-foreground">
              {item.kind === "course" || item.kind === "event"
                ? priceLabel
                : item.metaSecondary}
            </span>
          </div>
        </div>

        <Button
          asChild
          radius="xl"
          className="mt-auto w-full"
          variant={isActive ? "brand" : "brandSoft"}
        >
          <Link href={item.href}>
            {t("landing.learningHub.viewDetails")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-500",
          isActive && "opacity-100",
        )}
      />
    </article>
  );
};

export default LandingSliderCard;
