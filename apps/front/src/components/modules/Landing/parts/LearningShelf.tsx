"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useLearningShelf } from "@/hooks/useLearningShelf";
import { useI18n } from "@/hooks/useI18n";
import { ViewTransition } from "react";
import { Button } from "@ui/button";

import LearningShelfStage from "@modules/Landing/parts/LearningShelfStage";
import LearningShelfSpine from "@modules/Landing/parts/LearningShelfSpine";

import type { TLearningShelfProps } from "@/types/landing-module.types";

const formatShelfNumber = (value: number) => String(value).padStart(2, "0");

const LearningShelf = ({
  items,
  nextTabLabel,
  onSequenceEnd,
}: TLearningShelfProps) => {
  const { t } = useI18n();

  const {
    goTo,
    goNext,
    advance,
    isRunning,
    goPrevious,
    activeIndex,
    handleBlur,
    handleFocus,
    isUserPaused,
    togglePause,
    containerRef,
    handlePointerEnter,
    handlePointerLeave,
    prefersReducedMotion,
  } = useLearningShelf({ itemCount: items.length, onSequenceEnd });

  const activeItem = items[activeIndex];
  const isLastItem = activeIndex === items.length - 1;
  const upNextLabel = isLastItem ? nextTabLabel : items[activeIndex + 1].title;

  return (
    <div
      ref={containerRef}
      role="region"
      onBlur={handleBlur}
      onFocus={handleFocus}
      aria-roledescription="carousel"
      onPointerLeave={handlePointerLeave}
      onPointerEnter={handlePointerEnter}
      aria-label={t("landing.learningHub.shelf.label")}
      className="flex flex-col gap-3 xl:flex-row xl:gap-4"
    >
      <div className="min-w-0 flex-1 overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div
          role="group"
          aria-roledescription="slide"
          aria-live={isRunning ? "off" : "polite"}
          aria-label={t("landing.learningHub.shelf.slide", {
            current: activeIndex + 1,
            total: items.length,
          })}
        >
          <ViewTransition key={activeItem.id}>
            <LearningShelfStage item={activeItem} index={activeIndex} />
          </ViewTransition>
        </div>

        <div className="flex items-center gap-2 border-t px-3 py-3 sm:gap-3 sm:px-4">
          {prefersReducedMotion ? null : (
            <Button
              size="icon"
              type="button"
              radius="full"
              variant="outline"
              onClick={togglePause}
              aria-label={
                isUserPaused
                  ? t("landing.learningHub.shelf.play")
                  : t("landing.learningHub.shelf.pause")
              }
            >
              {isUserPaused ? <Play /> : <Pause />}
            </Button>
          )}

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center justify-between gap-3 text-xs font-semibold text-muted-foreground">
              <span className="truncate">
                {t("landing.learningHub.shelf.upNext")} ·{" "}
                <span className="text-foreground">{upNextLabel}</span>
              </span>
              <span className="shrink-0 font-mono text-foreground">
                {formatShelfNumber(activeIndex + 1)} /{" "}
                {formatShelfNumber(items.length)}
              </span>
            </div>

            {prefersReducedMotion ? null : (
              <div
                aria-hidden
                className="h-1 overflow-hidden rounded-full bg-muted"
              >
                <div
                  key={activeItem.id}
                  data-paused={!isRunning}
                  onAnimationEnd={advance}
                  className="landing-shelf-progress h-full rounded-full bg-primary"
                />
              </div>
            )}
          </div>

          <Button
            size="icon"
            type="button"
            radius="full"
            variant="outline"
            onClick={goPrevious}
            aria-label={t("landing.learningHub.shelf.previous")}
          >
            <ChevronLeft />
          </Button>

          <Button
            size="icon"
            type="button"
            radius="full"
            variant="outline"
            onClick={goNext}
            aria-label={t("landing.learningHub.shelf.next")}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="flex h-44 gap-1.5 pt-3 sm:gap-2 xl:h-auto xl:items-stretch">
        {items.map((item, index) => (
          <LearningShelfSpine
            item={item}
            index={index}
            key={`${item.kind}-${item.id}`}
            isActive={index === activeIndex}
            onSelect={() => goTo(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default LearningShelf;
