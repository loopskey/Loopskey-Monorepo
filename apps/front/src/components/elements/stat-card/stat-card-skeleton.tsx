import { STAT_CARD_FRAME_CLASS_NAME, StatCardHead } from "./stat-card-head";
import { Skeleton } from "@ui/skeleton";
import { cn } from "@/lib/utils";

import type { StatCardSkeletonProps } from "@/types/stat-card.types";

export const StatCardSkeleton = ({
  icon,
  title,
  className,
  hasSplit = false,
}: StatCardSkeletonProps) => (
  <div aria-hidden className={cn(STAT_CARD_FRAME_CLASS_NAME, className)}>
    <StatCardHead title={title} icon={icon} />

    <Skeleton className="h-9 w-24 md:h-10" />

    {hasSplit ? (
      <>
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-4 w-3/4" />
      </>
    ) : (
      <Skeleton className="h-3.5 w-2/3" />
    )}
  </div>
);
