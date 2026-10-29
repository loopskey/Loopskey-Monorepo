import { getContentCategoryArtSrc } from "@utils/content-category-art.constant";
import { cn } from "@/lib/utils";

import type { TContentThumbnailProps } from "@/types/element.types";

import Image from "next/image";

export const ContentThumbnail = ({
  priority,
  category,
  className,
}: TContentThumbnailProps) => (
  <Image
    fill
    alt=""
    unoptimized
    priority={priority}
    src={getContentCategoryArtSrc(category)}
    className={cn("object-cover object-[100%_center]", className)}
  />
);
