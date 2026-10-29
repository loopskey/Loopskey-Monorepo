"use client";

import { CONTENT_CATEGORY_ART_CLASS_NAME } from "@utils/content-category-art.constant";
import { getContentCategoryArtSrc } from "@utils/content-category-art.constant";
import { isValidImageSrc } from "@utils/image-src.util";
import { useState } from "react";
import { cn } from "@/lib/utils";

import type { TContentThumbnailProps } from "@/types/element.types";

import Image from "next/image";

export const ContentThumbnail = ({
  title,
  sizes,
  imageUrl,
  priority,
  category,
  className,
}: TContentThumbnailProps) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const trimmedUrl = imageUrl?.trim() ?? "";
  const src = isValidImageSrc(trimmedUrl) ? trimmedUrl : null;

  if (src && src !== failedSrc)
    return (
      <Image
        fill
        src={src}
        sizes={sizes}
        alt={title || ""}
        priority={priority}
        onError={() => setFailedSrc(src)}
        className={cn("object-cover", className)}
      />
    );

  return (
    <div
      aria-hidden
      style={{
        backgroundImage: `url(${getContentCategoryArtSrc(category)})`,
      }}
      className={cn(
        "absolute inset-0",
        CONTENT_CATEGORY_ART_CLASS_NAME,
        className,
      )}
    />
  );
};
