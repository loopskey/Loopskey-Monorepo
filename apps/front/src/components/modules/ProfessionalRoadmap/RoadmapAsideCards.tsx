"use client";

import { ROADMAP_CATALOG_HREF } from "@/utils/roadmap-navigation.util";
import { canEditRoadmap } from "@/utils/roadmap-library.util";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

import type { TRoadmapEditCardProps } from "@/types/professional-roadmap-chat.types";

import Link from "next/link";

import * as L from "lucide-react";

const KEY = "professionalDashboard.roadmap";

export const RoadmapEditCard = ({
  onEdit,
  roadmap,
  editingRoadmapId,
}: TRoadmapEditCardProps) => {
  const { t } = useI18n();

  if (!canEditRoadmap(roadmap)) return null;

  return (
    <section
      aria-labelledby="roadmap-edit-title"
      className="space-y-2 rounded-2xl bg-muted p-4"
    >
      <h2 id="roadmap-edit-title" className="font-semibold text-foreground">
        {t(`${KEY}.editCard.title`)}
      </h2>
      <p className="text-sm text-muted-foreground">
        {t(`${KEY}.editCard.description`)}
      </p>
      <Button
        type="button"
        variant="outline"
        disabled={Boolean(editingRoadmapId)}
        onClick={() => onEdit(roadmap.roadmapId)}
      >
        {editingRoadmapId === roadmap.roadmapId ? (
          <L.Loader2 aria-hidden className="animate-spin" />
        ) : (
          <L.Pencil aria-hidden />
        )}
        {t(`${KEY}.header.editRoadmap`)}
      </Button>
    </section>
  );
};

export const RoadmapCatalogCard = () => {
  const { t } = useI18n();

  return (
    <section
      aria-labelledby="roadmap-catalog-card-title"
      className="space-y-1.5 rounded-2xl border p-4"
    >
      <h2
        id="roadmap-catalog-card-title"
        className="font-semibold text-foreground"
      >
        {t(`${KEY}.catalogCard.title`)}
      </h2>
      <p className="text-sm text-muted-foreground">
        {t(`${KEY}.catalogCard.description`)}
      </p>
      <Link
        href={ROADMAP_CATALOG_HREF}
        className="inline-flex items-center gap-1 rounded-sm text-sm font-semibold text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
      >
        {t(`${KEY}.catalogCard.action`)}
        <L.ArrowRight aria-hidden className="size-4" />
      </Link>
    </section>
  );
};
