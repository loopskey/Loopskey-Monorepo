import { Route } from "lucide-react";
import { cn } from "@/lib/utils";

import type { TRoadmapTileProps } from "@/types/element.types";

const TILE_TINTS = [
  "bg-accent text-primary",
  "bg-brand-sky/15 text-brand-navy",
  "bg-brand-orange/15 text-brand-orange-text",
  "bg-success-soft text-success-soft-foreground",
] as const;

const tintFor = (category?: string | null) => {
  if (!category) return TILE_TINTS[0];
  let hash = 0;
  for (const character of category)
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return TILE_TINTS[hash % TILE_TINTS.length];
};

export const RoadmapTile = ({ category, className }: TRoadmapTileProps) => (
  <span
    aria-hidden
    className={cn(
      "grid size-10 shrink-0 place-items-center rounded-xl",
      tintFor(category),
      className,
    )}
  >
    <Route className="size-1/2" />
  </span>
);
