import { Skeleton } from "@ui/skeleton";
import { cn } from "@/lib/utils";

const ContentCardSkeleton = ({ className }: { className?: string }) => {
  return (
    <div
      aria-hidden
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card",
        className,
      )}
    >
      <Skeleton className="aspect-video w-full rounded-none" />

      <div className="flex flex-col gap-2.5 px-4 py-3.5">
        <Skeleton className="h-3 w-2/5 rounded-full" />
        <Skeleton className="h-4.5 w-4/5 rounded-full" />
        <Skeleton className="h-4.5 w-3/5 rounded-full" />
        <Skeleton className="h-3 w-1/3 rounded-full" />
        <Skeleton className="mt-1 h-3 w-1/2 rounded-full" />
      </div>

      <div className="flex min-h-12 items-center justify-between gap-3 border-t px-4">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-3 w-20 rounded-full" />
      </div>
    </div>
  );
};

export default ContentCardSkeleton;
