"use client";

import { RoadmapDraftStatus } from "@/lib/graphql/base";
import { ROADMAP_TAB_HREF } from "@/utils/roadmap-navigation.util";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

import type { RoadmapDraftStatus as TRoadmapDraftStatus } from "@/lib/graphql/base";

import Link from "next/link";

import * as L from "lucide-react";

const KEY = "professionalRoadmapChat.closed";

type TRoadmapClosedBannerProps = {
  isEdit: boolean;
  title?: string | null;
  status: TRoadmapDraftStatus;
};

export const RoadmapClosedBanner = ({
  title,
  status,
  isEdit,
}: TRoadmapClosedBannerProps) => {
  const { t } = useI18n();
  const isGenerating = status === RoadmapDraftStatus.Generating;
  const variant = isGenerating ? "generating" : isEdit ? "edit" : "create";

  return (
    <div
      role="status"
      className="flex flex-col gap-2 border-b bg-muted/50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-5"
    >
      <div className="flex min-w-0 items-start gap-2.5">
        {isGenerating ? (
          <L.Loader2
            aria-hidden
            className="mt-0.5 size-4 shrink-0 animate-spin text-primary"
          />
        ) : (
          <L.CheckCircle2
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-success"
          />
        )}
        <div className="min-w-0 text-sm">
          <p className="font-medium">
            {title
              ? t(`${KEY}.${variant}.title`, { title })
              : t(`${KEY}.${variant}.titleUntitled`)}
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            {t(`${KEY}.${variant}.description`)}
          </p>
        </div>
      </div>

      <Button
        asChild
        size="sm"
        variant="outline"
        className="shrink-0 self-start sm:self-center"
      >
        <Link href={ROADMAP_TAB_HREF}>
          {t(`${KEY}.goToRoadmap`)}
          <L.ArrowRight aria-hidden className="size-4" />
        </Link>
      </Button>
    </div>
  );
};
