"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Headphones, PlayCircle } from "lucide-react";
import { TLandingContentCarouselProps } from "@/types/landing-module.types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TLandingContentItem } from "@/types/landing-module.types";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import LandingSliderCard from "@modules/Landing/parts/LandingSliderCard";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

export const getKindIcon = (kind: TLandingContentItem["kind"]) => {
  if (kind === "event") return <CalendarDays className="h-4 w-4" />;
  if (kind === "podcast") return <Headphones className="h-4 w-4" />;
  if (kind === "youtube") return <PlayCircle className="h-4 w-4" />;
  return <PlayCircle className="h-4 w-4" />;
};

const LandingContentCarousel = ({
  items,
  onItemHover,
  activeItemId,
}: TLandingContentCarouselProps) => {
  const { t } = useI18n();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const autoplay = useRef(
    Autoplay({
      delay: 3500,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: items.length > 3,
      align: "start",
      containScroll: "trimSnaps",
      dragFree: false,
      skipSnaps: false,
    },
    [autoplay.current],
  );

  const carouselItems = useMemo(() => items.slice(0, 20), [items]);

  const onSelect = useCallback(() => {
    if (!emblaApi || carouselItems.length === 0) return;
    const index = emblaApi.selectedScrollSnap();
    const safeIndex = index % carouselItems.length;
    setSelectedIndex(safeIndex);
    const selectedItem = carouselItems[safeIndex];
    if (selectedItem) onItemHover(selectedItem);
  }, [emblaApi, carouselItems, onItemHover]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    emblaApi?.reInit();
  }, [emblaApi, carouselItems.length]);

  const scrollPrev = () => {
    emblaApi?.scrollPrev();
  };

  const scrollNext = () => {
    emblaApi?.scrollNext();
  };

  const scrollTo = (index: number) => {
    emblaApi?.scrollTo(index);
  };

  if (!carouselItems.length) return null;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-glass-border bg-background/35 p-4 shadow-sm backdrop-blur-xl md:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.14),transparent_34%),radial-gradient(circle_at_90%_20%,rgba(20,184,166,0.10),transparent_36%)]" />
      <div className="relative z-10 mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">
            {t("landing.learningHub.carouselCount", {
              count: carouselItems.length,
            })}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {t("landing.learningHub.carouselHint")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            type="button"
            radius="full"
            variant="glass"
            onClick={scrollPrev}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            type="button"
            radius="full"
            variant="glass"
            onClick={scrollNext}
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative z-10">
        <div className="landing-carousel-fade-left" />
        <div className="landing-carousel-fade-right" />
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="-ml-4 flex">
            {carouselItems.map((item, index) => {
              const isActive =
                activeItemId === item.id || selectedIndex === index;

              return (
                <div
                  key={`${item.kind}-${item.id}`}
                  className={cn(
                    "min-w-0 pl-4",
                    "flex-[0_0_88%]",
                    "sm:flex-[0_0_52%]",
                    "md:flex-[0_0_44%]",
                    "lg:flex-[0_0_46%]",
                    "xl:flex-[0_0_34%]",
                  )}
                  onMouseEnter={() => {
                    onItemHover(item);
                  }}
                >
                  <LandingSliderCard
                    item={item}
                    isActive={isActive}
                    onHover={() => {
                      onItemHover(item);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {scrollSnaps.length > 1 ? (
        <div className="relative z-10 mt-5 flex items-center justify-center gap-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => scrollTo(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                selectedIndex === index
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/25 hover:bg-primary/45",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default LandingContentCarousel;
