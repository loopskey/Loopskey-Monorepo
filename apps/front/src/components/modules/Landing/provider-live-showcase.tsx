"use client";

import { useLandingProviderShowcase } from "@/hooks/useLandingProvider";
import { ProviderDashboardRange } from "@/lib/graphql/base";

import LandingProviderView from "./LandingProviderSectionView";

import * as API from "@/lib/rtk/endpoints/provider.api";

const RANGE = { input: { range: ProviderDashboardRange.Last_30Days } };
const PAGE = { pagination: { take: 50 } };

const ProviderLiveShowcase = () => {
  const overview = API.useProviderOverviewQuery(RANGE);
  const analytics = API.useProviderAnalyticsQuery(RANGE);
  const events = API.useProviderEventsTableQuery(PAGE);
  const promotions = API.useProviderPromotionRequestsQuery(PAGE);
  const model = useLandingProviderShowcase({
    overview,
    analytics,
    events,
    promotions,
  });
  return <LandingProviderView model={model} />;
};

export default ProviderLiveShowcase;
