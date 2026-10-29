import { LANDING_HUB_ITEM_CLASS_NAME } from "@/utils/landing-public.constant";
import { LANDING_HUB_LIST_CLASS_NAME } from "@/utils/landing-public.constant";
import { LANDING_HUB_ROW_SIZE } from "@/utils/landing-public.constant";

import ContentCardSkeleton from "@modules/Content/ContentCardSkeleton";

const LandingContentSkeleton = () => (
  <ul aria-busy role="status" className={LANDING_HUB_LIST_CLASS_NAME}>
    {Array.from({ length: LANDING_HUB_ROW_SIZE }).map((_, index) => (
      <li key={index} className={LANDING_HUB_ITEM_CLASS_NAME}>
        <ContentCardSkeleton className="w-full" />
      </li>
    ))}
  </ul>
);

export default LandingContentSkeleton;
