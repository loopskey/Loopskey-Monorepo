import { CONTENT_CATEGORY_ART_CLASS_NAME } from "@utils/content-category-art.constant";
import { getContentCategoryArtSrc } from "@utils/content-category-art.constant";
import { cn } from "@/lib/utils";

import type { RoadmapArtProps } from "@/types/element.types";

export const RoadmapArt = ({ category, className }: RoadmapArtProps) => (
  <span
    aria-hidden
    className={cn(
      "relative block shrink-0 overflow-hidden rounded-lg bg-muted",
      className,
    )}
  >
    <span
      className={cn("absolute inset-0", CONTENT_CATEGORY_ART_CLASS_NAME)}
      style={{
        backgroundImage: `url(${getContentCategoryArtSrc(category)})`,
      }}
    />
  </span>
);
