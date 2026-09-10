"use client";

import { TContentThumbnailProps } from "@/types/element.types";
import { CONTENT_MOTIF_VIEW_BOX } from "@elements/content-motifs";
import { TContentThumbnailKind } from "@/types/element.types";
import { resolveContentMotif } from "@elements/content-motifs";
import { isValidImageSrc } from "@utils/function-helper";
import { useState } from "react";
import { cn } from "@/lib/utils";

import Image from "next/image";

const KIND_CLASS_NAME: Record<TContentThumbnailKind, string> = {
  course: "from-ct-course/25 to-ct-course/10 text-ct-course",
  event: "from-ct-event/25 to-ct-event/10 text-ct-event",
  podcast: "from-ct-podcast/25 to-ct-podcast/10 text-ct-podcast",
  youtube: "from-ct-youtube/25 to-ct-youtube/10 text-ct-youtube",
};

const MOTIF_ROTATIONS = [-9, -4.5, 0, 4.5, 9];
const MOTIF_SCALES = [0.94, 1, 1.06, 1.12];
const MOTIF_OFFSETS = [-12, -6, 0, 6, 12];

const MOTIF_CENTER_X = 80;
const MOTIF_CENTER_Y = 60;

const FNV_OFFSET_BASIS = 2166136261;
const FNV_PRIME = 16777619;

const hashItemId = (id: string) => {
  let hash = FNV_OFFSET_BASIS;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, FNV_PRIME);
  }
  return hash >>> 0;
};

const buildMotifTransform = (id: string) => {
  const hash = hashItemId(id);
  const rotation = MOTIF_ROTATIONS[hash % MOTIF_ROTATIONS.length];
  const scale = MOTIF_SCALES[(hash >>> 4) % MOTIF_SCALES.length];
  const offsetX = MOTIF_OFFSETS[(hash >>> 8) % MOTIF_OFFSETS.length];
  const offsetY = MOTIF_OFFSETS[(hash >>> 12) % MOTIF_OFFSETS.length];

  return [
    `translate(${MOTIF_CENTER_X + offsetX} ${MOTIF_CENTER_Y + offsetY})`,
    `rotate(${rotation})`,
    `scale(${scale})`,
    `translate(${-MOTIF_CENTER_X} ${-MOTIF_CENTER_Y})`,
  ].join(" ");
};

export const ContentThumbnail = ({
  id,
  kind,
  title,
  sizes,
  imageUrl,
  category,
  priority,
  className,
  sourceLabel,
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
        priority={priority}
        alt={title || ""}
        onError={() => setFailedSrc(src)}
        className={cn("object-cover", className)}
      />
    );

  const Motif = resolveContentMotif(category);

  return (
    <div
      aria-hidden
      className={cn(
        "@container absolute inset-0 flex items-center justify-center overflow-hidden",
        "p-2 @[12rem]:p-4",
        "bg-card bg-gradient-to-br",
        KIND_CLASS_NAME[kind],
      )}
    >
      <svg
        aria-hidden
        focusable="false"
        preserveAspectRatio="xMidYMid slice"
        viewBox={CONTENT_MOTIF_VIEW_BOX}
        className="absolute inset-0 h-full w-full opacity-35 [mask-image:radial-gradient(ellipse_62%_46%_at_50%_50%,transparent_25%,black_85%)]"
      >
        <g transform={buildMotifTransform(id)}>
          <Motif />
        </g>
      </svg>

      <p className="relative line-clamp-3 text-balance text-center text-[11px] font-medium leading-tight text-foreground [overflow-wrap:anywhere] @[12rem]:text-sm @[12rem]:leading-5">
        {title}
      </p>

      {sourceLabel ? (
        <span className="absolute bottom-1 right-2 max-w-[70%] truncate text-[9px] font-medium uppercase tracking-wide text-muted-foreground @[12rem]:bottom-2 @[12rem]:right-3 @[12rem]:text-[10px]">
          {sourceLabel}
        </span>
      ) : null}
    </div>
  );
};
