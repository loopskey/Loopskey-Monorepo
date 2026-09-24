"use client";

import { TRoadmapHeroProps } from "@/types/professional-roadmap-chat.types";
import { daysUntil } from "@/utils/roadmap-journey.util";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import * as DM from "@ui/dropdown-menu";
import * as L from "lucide-react";

import Link from "next/link";

const KEY = "professionalDashboard.roadmap";

export const RoadmapHero = ({
  t,
  title,
  locale,
  progress,
  headingRef,
  totalSteps,
  targetDate,
  description,
  phasesCount,
  continueHref,
  viewFullHref,
  nextStepTitle,
  estimatedWeeks,
  completedSteps,
  newRoadmapHref,
}: TRoadmapHeroProps) => {
  const target = targetDate ? new Date(targetDate) : null;
  const remaining = target ? daysUntil(target) : null;

  const targetLabel = () => {
    if (!target) return null;
    if (remaining !== null && remaining < 0)
      return t(`${KEY}.targetDatePassed`);
    if (remaining === 0) return t(`${KEY}.targetDateToday`);
    return t(`${KEY}.hero.targetDateWithCount`, {
      date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
        target,
      ),
      days: remaining ?? 0,
    });
  };

  const parts = [
    t(`${KEY}.hero.phasesCount`, { count: phasesCount }),
    t(`${KEY}.ofSteps`, { completed: completedSteps, total: totalSteps }),
    estimatedWeeks ? t(`${KEY}.weeks`, { count: estimatedWeeks }) : null,
    targetLabel(),
  ].filter(Boolean);

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-primary">
            {t(`${KEY}.heroEyebrow`)}
          </p>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="mt-1 text-2xl font-medium tracking-tight outline-none"
          >
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
          <p className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-sm text-muted-foreground">
            {parts.map((part, index) => (
              <span key={index} className="flex items-center gap-2">
                {index > 0 ? (
                  <span aria-hidden="true" className="text-border">
                    ·
                  </span>
                ) : null}
                {part}
              </span>
            ))}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button asChild radius="xl">
              <Link href={continueHref}>
                {nextStepTitle
                  ? t(`${KEY}.hero.continueStep`, { step: nextStepTitle })
                  : t(`${KEY}.continueRoadmap`)}
                <L.ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <DM.DropdownMenu>
              <DM.DropdownMenuTrigger asChild>
                <Button
                  radius="xl"
                  variant="outline"
                  size="icon"
                  aria-label={t(`${KEY}.hero.moreActions`)}
                >
                  <L.MoreHorizontal className="h-4 w-4" />
                </Button>
              </DM.DropdownMenuTrigger>
              <DM.DropdownMenuContent align="start">
                <DM.DropdownMenuItem asChild>
                  <Link href={viewFullHref}>
                    <L.ExternalLink className="h-4 w-4" />
                    {t(`${KEY}.viewFullRoadmap`)}
                  </Link>
                </DM.DropdownMenuItem>
                <DM.DropdownMenuItem asChild>
                  <Link href={newRoadmapHref}>
                    <L.Plus className="h-4 w-4" />
                    {t(`${KEY}.newRoadmap`)}
                  </Link>
                </DM.DropdownMenuItem>
              </DM.DropdownMenuContent>
            </DM.DropdownMenu>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center">
          <div
            role="img"
            aria-label={t(`${KEY}.hero.progressRingLabel`, { progress })}
            className="relative flex h-32 w-32 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(var(--primary) ${progress * 3.6}deg, var(--muted) 0deg)`,
            }}
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-card">
              <span className="text-2xl font-medium">{progress}%</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {t(`${KEY}.progressSection`)}
          </p>
        </div>
      </div>
    </GlassCard>
  );
};
