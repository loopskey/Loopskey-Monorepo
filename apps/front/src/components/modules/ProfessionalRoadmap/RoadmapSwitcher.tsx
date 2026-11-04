"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
import { RoadmapSwitcherPanel } from "@modules/ProfessionalRoadmap/RoadmapSwitcherPanel";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { RoadmapTile } from "@elements/roadmap-tile";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";

import type { TRoadmapSwitcherProps } from "@/types/professional-roadmap-chat.types";

import * as S from "@ui/sheet";
import * as L from "lucide-react";

const KEY = "professionalDashboard.roadmap";

export const RoadmapSwitcher = ({
  roadmap,
  roadmaps,
  totalCount,
  headingRef,
  generatingGoal,
}: TRoadmapSwitcherProps) => {
  const { t } = useI18n();
  const isNarrow = useMediaQuery("(max-width: 639px)");
  const [isOpen, setIsOpen] = useState(false);
  const position = roadmaps.findIndex((item) => item.id === roadmap.id) + 1;
  const close = () => setIsOpen(false);

  const trigger = (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      className="group -ml-2 flex max-w-full items-center gap-3.5 rounded-2xl py-2 pl-2 pr-3 text-left outline-none transition-colors hover:bg-muted/50 hover:ring-1 hover:ring-border focus-visible:ring-2 focus-visible:ring-ring aria-expanded:bg-muted aria-expanded:ring-1 aria-expanded:ring-border"
    >
      <RoadmapTile category={roadmap.category} className="size-12" />
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-muted-foreground">
          {totalCount > 1 && position > 0
            ? t(`${KEY}.switcher.label`, {
                current: position,
                total: totalCount,
              })
            : t(`${KEY}.switcher.title`)}
        </span>
        <span className="flex items-center gap-2.5">
          <span className="line-clamp-2 text-xl font-semibold leading-snug tracking-tight text-foreground sm:line-clamp-1 sm:text-2xl">
            {roadmap.title}
          </span>
          <span
            aria-hidden
            className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-primary"
          >
            <L.ChevronDown className="size-4 transition-transform group-aria-expanded:rotate-180 motion-reduce:transition-none" />
          </span>
        </span>
        <span className="sr-only">{t(`${KEY}.switcher.open`)}</span>
      </span>
    </button>
  );

  const panel = (
    <RoadmapSwitcherPanel
      onNavigate={close}
      roadmaps={roadmaps}
      totalCount={totalCount}
      activeRoadmapId={roadmap.id}
      generatingGoal={generatingGoal}
    />
  );

  return (
    <h1 ref={headingRef} tabIndex={-1} className="min-w-0 outline-none">
      {isNarrow ? (
        <S.Sheet open={isOpen} onOpenChange={setIsOpen}>
          <S.SheetTrigger asChild>{trigger}</S.SheetTrigger>
          <S.SheetContent
            side="bottom"
            aria-describedby={undefined}
            className="max-h-[88dvh] gap-0 rounded-t-3xl p-0"
          >
            <S.SheetHeader className="pb-1 pr-12">
              <S.SheetTitle>{t(`${KEY}.switcher.title`)}</S.SheetTitle>
            </S.SheetHeader>
            {panel}
          </S.SheetContent>
        </S.Sheet>
      ) : (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={8}
            aria-label={t(`${KEY}.switcher.title`)}
            className="w-[32rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl p-0 shadow-xl"
          >
            {panel}
          </PopoverContent>
        </Popover>
      )}
    </h1>
  );
};
