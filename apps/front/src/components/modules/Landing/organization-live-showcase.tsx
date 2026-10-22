"use client";

import { useLandingOrganizationShowcase } from "@/hooks/useLandingOrgShowcase";
import { useOrganizationOverviewQuery } from "@/lib/rtk/endpoints/org-dashboard.api";

import LandingOrganizationView from "./LandingOrgShowcaseView";

const OrganizationLiveShowcase = () => {
  const overview = useOrganizationOverviewQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const model = useLandingOrganizationShowcase(overview);
  return <LandingOrganizationView model={model} />;
};

export default OrganizationLiveShowcase;
