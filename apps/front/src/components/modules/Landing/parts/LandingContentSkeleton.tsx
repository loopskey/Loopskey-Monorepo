import { LANDING_SHELF_SIZE } from "@/utils/landing-shelf.constant";
import { Skeleton } from "@ui/skeleton";

const LandingContentSkeleton = () => {
  return (
    <div
      aria-busy
      className="flex flex-col gap-3 xl:flex-row xl:gap-4"
      role="status"
    >
      <div className="min-w-0 flex-1 overflow-hidden rounded-3xl border bg-card">
        <div className="flex h-[30.5rem] flex-col md:h-[26rem] md:flex-row xl:h-[27.5rem]">
          <Skeleton className="h-44 shrink-0 rounded-none md:h-auto md:w-[44%]" />

          <div className="flex min-w-0 flex-1 flex-col gap-3 p-5 md:p-8 xl:px-10">
            <Skeleton className="h-4 w-1/3 rounded-full" />
            <Skeleton className="h-8 w-4/5 rounded-full" />
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-2/3 rounded-full" />
            <Skeleton className="mt-auto h-12 w-full md:w-48" />
          </div>
        </div>

        <div className="flex items-center gap-3 border-t px-4 py-3">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <Skeleton className="h-4 flex-1 rounded-full" />
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <Skeleton className="size-10 shrink-0 rounded-full" />
        </div>
      </div>

      <div className="flex h-44 gap-1.5 pt-3 sm:gap-2 xl:h-auto">
        {Array.from({ length: LANDING_SHELF_SIZE }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-full min-w-0 flex-1 rounded-2xl xl:w-16 xl:flex-none"
          />
        ))}
      </div>
    </div>
  );
};

export default LandingContentSkeleton;
