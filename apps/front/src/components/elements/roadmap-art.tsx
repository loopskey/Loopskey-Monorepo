import { getContentCategoryArtSrc } from "@utils/content-category-art.constant";
import { cn } from "@/lib/utils";

import type { RoadmapArtProps } from "@/types/element.types";

import Image from "next/image";

const FALLBACK_CATEGORY = "GENERAL";

export const RoadmapArt = ({
  category,
  imageUrl,
  className,
  sizes = "56px",
}: RoadmapArtProps) => {
  const artSrc =
    getContentCategoryArtSrc(category) ??
    getContentCategoryArtSrc(FALLBACK_CATEGORY);

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
          className="absolute inset-0 bg-cover bg-[position:85%_center]"
          style={{ backgroundImage: `url(${artSrc})` }}
        />
      )}
    </span>
  );
};
