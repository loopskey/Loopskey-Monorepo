"use client";

import { isValidImageSrc } from "@utils/function-helper";
import { useState } from "react";
import { cn } from "@/lib/utils";

import type { TContentThumbnailProps } from "@/types/element.types";
import type { TContentThumbnailKind } from "@/types/element.types";

import Image from "next/image";

const KIND_ART_CLASS_NAME: Record<TContentThumbnailKind, string> = {
  course: "bg-[url('/content-art-course.svg')]",
  event: "bg-[url('/content-art-event.svg')]",
  podcast: "bg-[url('/content-art-podcast.svg')]",
  youtube: "bg-[url('/content-art-youtube.svg')]",
};

export const ContentThumbnail = ({
  kind,
  title,
  sizes,
  imageUrl,
  priority,
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
      className={cn(
        "absolute inset-0 bg-cover bg-center",
        KIND_ART_CLASS_NAME[kind],
        className,
      )}
    />
  );
};
