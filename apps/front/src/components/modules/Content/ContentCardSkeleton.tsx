import { Skeleton } from "@ui/skeleton";
import { cn } from "@/lib/utils";

const ContentCardSkeleton = ({ className }: { className?: string }) => {
  return (
    <div
      aria-hidden
      className={cn(
        "flex aspect-[3/4] min-h-[27.5rem] min-w-0 flex-col justify-end overflow-hidden rounded-2xl bg-muted",
        className,
      )}
    >
      <div className="flex flex-col gap-2 px-6 pb-5">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-5 w-4/5 rounded-full" />
        <Skeleton className="h-5 w-3/5 rounded-full" />
        <Skeleton className="h-3.5 w-full rounded-full" />
        <Skeleton className="mt-1.5 h-3 w-32 rounded-full" />
      </div>

      <Skeleton className="h-14 w-full rounded-none" />
    </div>
  );
};

export default ContentCardSkeleton;
