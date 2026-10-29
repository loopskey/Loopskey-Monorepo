import { CONTENT_CATEGORY_ART_CLASS_NAME } from "@utils/content-category-art.constant";
import { getContentCategoryArtSrc } from "@utils/content-category-art.constant";
import { cn } from "@/lib/utils";

import type { TContentThumbnailProps } from "@/types/element.types";

export const ContentThumbnail = ({
  category,
  className,
}: TContentThumbnailProps) => (
  <div
    aria-hidden
    style={{ backgroundImage: `url(${getContentCategoryArtSrc(category)})` }}
    className={cn(
      "absolute inset-0",
      CONTENT_CATEGORY_ART_CLASS_NAME,
      className,
    )}
  />
);
