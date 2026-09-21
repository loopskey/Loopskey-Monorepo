import { Skeleton } from "@ui/skeleton";
import { cn } from "@/lib/utils";

const ContentCardSkeleton = ({ className }: { className?: string }) => {
  return (
    <div
      aria-hidden
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm",
        className,
      )}
    >
      <div className="flex flex-1 gap-3 p-3 sm:flex-col sm:gap-0 sm:p-0">
        <Skeleton className="size-24 shrink-0 rounded-lg sm:aspect-video sm:size-auto sm:rounded-none" />

        <div className="flex flex-1 flex-col gap-2 sm:p-4">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-4 w-4/5 rounded-full" />
          <Skeleton className="h-4 w-3/5 rounded-full" />
          <Skeleton className="hidden h-3.5 w-full rounded-full sm:block" />
          <Skeleton className="mt-auto h-3 w-32 rounded-full" />
        </div>
      </div>

      <div className="px-3 pb-3 sm:mt-auto sm:border-t sm:px-4 sm:py-3">
        <Skeleton className="h-9 w-full rounded-lg max-md:h-11" />
      </div>
    </div>
  );
};

export default ContentCardSkeleton;
