import { CourseCategory } from "@/lib/graphql/base";
import { cn } from "@/lib/utils";

import type { RoadmapArtProps } from "@/types/element.types";

import Image from "next/image";

const CATEGORY_ART_CLASS_NAME: Record<CourseCategory, string> = {
  [CourseCategory.Cpd]: "bg-[url('/roadmap-art-cpd.svg')]",
  [CourseCategory.Other]: "bg-[url('/roadmap-art-other.svg')]",
  [CourseCategory.Design]: "bg-[url('/roadmap-art-design.svg')]",
  [CourseCategory.Finance]: "bg-[url('/roadmap-art-finance.svg')]",
  [CourseCategory.Business]: "bg-[url('/roadmap-art-business.svg')]",
  [CourseCategory.Education]: "bg-[url('/roadmap-art-education.svg')]",
  [CourseCategory.Marketing]: "bg-[url('/roadmap-art-marketing.svg')]",
  [CourseCategory.Technology]: "bg-[url('/roadmap-art-technology.svg')]",
  [CourseCategory.Leadership]: "bg-[url('/roadmap-art-leadership.svg')]",
  [CourseCategory.Compliance]: "bg-[url('/roadmap-art-compliance.svg')]",
  [CourseCategory.Healthcare]: "bg-[url('/roadmap-art-healthcare.svg')]",
  [CourseCategory.Engineering]: "bg-[url('/roadmap-art-engineering.svg')]",
};

export const RoadmapArt = ({
  category,
  imageUrl,
  className,
  sizes = "56px",
}: RoadmapArtProps) => {
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
          className={cn(
            "absolute inset-0 bg-cover bg-center",
            CATEGORY_ART_CLASS_NAME[category ?? CourseCategory.Other],
          )}
        />
      )}
    </span>
  );
};
