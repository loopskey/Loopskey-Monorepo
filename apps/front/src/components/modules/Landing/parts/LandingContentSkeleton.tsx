import { LANDING_HUB_ITEM_CLASS_NAME } from "@/utils/landing-public.constant";
import { LANDING_HUB_LIST_CLASS_NAME } from "@/utils/landing-public.constant";
import { LANDING_HUB_ROW_SIZE } from "@/utils/landing-public.constant";
import { Skeleton } from "@ui/skeleton";

const LandingContentSkeleton = () => (
  <ul aria-busy role="status" className={LANDING_HUB_LIST_CLASS_NAME}>
    {Array.from({ length: LANDING_HUB_ROW_SIZE }).map((_, index) => (
      <li key={index} className={LANDING_HUB_ITEM_CLASS_NAME}>
        <div className="w-full overflow-hidden rounded-2xl border bg-card">
          <Skeleton className="aspect-video w-full rounded-none" />

          <div className="flex flex-col gap-3 p-5">
            <Skeleton className="h-5 w-1/3 rounded-full" />
            <Skeleton className="h-6 w-4/5 rounded-full" />
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-2/3 rounded-full" />
            <Skeleton className="mt-3 h-12 w-full rounded-xl" />
          </div>
        </div>
      </li>
    ))}
  </ul>
);

export default LandingContentSkeleton;
