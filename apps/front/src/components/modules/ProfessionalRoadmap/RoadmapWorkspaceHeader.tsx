"use client";

import { translateWithFallback } from "@/utils/function-helper";
import { ROADMAP_CHAT_HREF } from "@/utils/roadmap-navigation.util";
import { humanizeEnumValue } from "@/utils/function-helper";
import { RoadmapMatchTier } from "@/lib/graphql/base";
import { RoadmapSource } from "@/lib/graphql/base";
import { RoadmapArt } from "@elements/roadmap-art";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import type { RoadmapWorkspaceHeaderProps } from "@/types/professional-roadmap-chat.types";

import Link from "next/link";

import * as DM from "@ui/dropdown-menu";
import * as A from "@ui/alert-dialog";
import * as L from "lucide-react";

const KEY = "professionalDashboard.roadmap";

const DESCRIPTION_CLAMP_MIN_LENGTH = 160;

export const RoadmapWorkspaceHeader = ({
  roadmap,
  onUnenroll,
  headingRef,
  isUnenrolling,
}: RoadmapWorkspaceHeaderProps) => {
  const { t } = useI18n();
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const isGenerated = roadmap.source === RoadmapSource.Generated;
  const isCloseMatch =
    Boolean(roadmap.matchTier) && roadmap.matchTier !== RoadmapMatchTier.Exact;
  const isClampable = roadmap.description.length > DESCRIPTION_CLAMP_MIN_LENGTH;

  const categoryLabel = roadmap.category
    ? translateWithFallback(
        t,
        `content.enums.courseCategory.${roadmap.category}`,
        humanizeEnumValue(roadmap.category),
      )
    : null;
  const levelLabel = translateWithFallback(
    t,
    `content.enums.courseLevel.${roadmap.level}`,
    humanizeEnumValue(roadmap.level),
  );

  return (
    <header className="space-y-3">
      <div className="flex items-start gap-4">
        <RoadmapArt
          category={roadmap.category}
          imageUrl={roadmap.imageUrl}
          className="hidden size-14 rounded-xl sm:block"
        />

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-start justify-between gap-3">
            <h2
              tabIndex={-1}
              ref={headingRef}
              className="text-balance text-xl font-medium leading-snug tracking-tight outline-none"
            >
              {roadmap.title}
            </h2>

            <DM.DropdownMenu>
              <DM.DropdownMenuTrigger asChild>
                <Button
                  size="iconSm"
                  variant="ghost"
                  disabled={isUnenrolling}
                  aria-label={t(`${KEY}.hero.moreActions`)}
                >
                  {isUnenrolling ? (
                    <L.Loader2 className="size-4 animate-spin" />
                  ) : (
                    <L.MoreHorizontal className="size-4" />
                  )}
                </Button>
              </DM.DropdownMenuTrigger>

              <DM.DropdownMenuContent align="end">
                <DM.DropdownMenuItem
                  variant="destructive"
                  onSelect={() => setIsConfirmOpen(true)}
                >
                  <L.LogOut className="size-4" />
                  {t(`${KEY}.unenroll`)}
                </DM.DropdownMenuItem>
              </DM.DropdownMenuContent>
            </DM.DropdownMenu>
          </div>

          <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <li
              className={cn(
                "flex items-center gap-1.5",
                isGenerated && "font-semibold text-primary",
              )}
            >
              {isGenerated ? (
                <L.Sparkles aria-hidden className="size-3.5" />
              ) : (
                <L.BookOpen aria-hidden className="size-3.5" />
              )}
              {t(
                isGenerated ? `${KEY}.card.aiGenerated` : `${KEY}.card.catalog`,
              )}
            </li>
            {categoryLabel ? <li>{categoryLabel}</li> : null}
            <li>{levelLabel}</li>
          </ul>
        </div>
      </div>

      {roadmap.description ? (
        <div>
          <p
            className={cn(
              "max-w-3xl text-sm leading-6 text-muted-foreground",
              isClampable && !isDescriptionOpen && "line-clamp-2",
            )}
          >
            {roadmap.description}
          </p>

          {isClampable ? (
            <button
              type="button"
              aria-expanded={isDescriptionOpen}
              onClick={() => setIsDescriptionOpen((current) => !current)}
              className="mt-1 rounded-sm text-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t(isDescriptionOpen ? `${KEY}.showLess` : `${KEY}.showMore`)}
            </button>
          ) : null}
        </div>
      ) : null}

      {isCloseMatch ? (
        <div className="flex items-start gap-3 rounded-lg bg-warning-soft p-3 text-sm">
          <L.AlertTriangle
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-warning-soft-foreground"
          />
          <div className="min-w-0 space-y-1">
            <p className="font-medium">
              {t(`${KEY}.closeMatchDisclosure.title`)}
            </p>
            <p className="leading-6 text-muted-foreground">
              {t(`${KEY}.closeMatchDisclosure.description`)}
            </p>
            {roadmap.draftId ? (
              <Link
                className="inline-block font-medium text-primary underline-offset-4 hover:underline"
                href={`${ROADMAP_CHAT_HREF}?draftId=${encodeURIComponent(
                  roadmap.draftId,
                )}&focus=preferences`}
              >
                {t(`${KEY}.closeMatchDisclosure.action`)}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <A.AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <A.AlertDialogContent>
          <A.AlertDialogHeader>
            <A.AlertDialogTitle>
              {t(`${KEY}.card.unenrollTitle`)}
            </A.AlertDialogTitle>
            <A.AlertDialogDescription>
              {t(`${KEY}.card.unenrollDescription`, { title: roadmap.title })}
            </A.AlertDialogDescription>
          </A.AlertDialogHeader>
          <A.AlertDialogFooter>
            <A.AlertDialogCancel>{t("common.cancel")}</A.AlertDialogCancel>
            <A.AlertDialogAction onClick={() => onUnenroll(roadmap.id)}>
              {t(`${KEY}.unenroll`)}
            </A.AlertDialogAction>
          </A.AlertDialogFooter>
        </A.AlertDialogContent>
      </A.AlertDialog>
    </header>
  );
};
