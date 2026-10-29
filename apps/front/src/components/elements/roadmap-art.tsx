import { getContentCategoryArtSrc } from "@utils/content-category-art.constant";
import { CONTENT_CATEGORY_ART_CLASS_NAME } from "@utils/content-category-art.constant";
import { cn } from "@/lib/utils";

import type { RoadmapArtProps } from "@/types/element.types";

import Image from "next/image";

export const RoadmapArt = ({
  category,
  imageUrl,
  className,
  sizes = "56px",
}: RoadmapArtProps) => {
  const artSrc = getContentCategoryArtSrc(category);

  return (
    <span
      aria-hidden
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-lg bg-muted",
        className,
      )}
    >
      {imageUrl ? (
        <Image
          fill
          alt=""
          sizes={sizes}
          src={imageUrl}
          className="object-cover"
        />
      ) : (
        <span
          className={cn("absolute inset-0", CONTENT_CATEGORY_ART_CLASS_NAME)}
          style={{ backgroundImage: `url(${artSrc})` }}
        />
      )}
    </span>
  );
};
