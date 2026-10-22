"use client";

import { useLandingOrganizationShowcase } from "@/hooks/useLandingOrgShowcase";
import { useAuthSession } from "@/hooks/useAuthSession";

import LandingOrganizationView from "./LandingOrgShowcaseView";
import dynamic from "next/dynamic";

const Preview = () => (
  <LandingOrganizationView model={useLandingOrganizationShowcase()} />
);
const Live = dynamic(() => import("./organization-live-showcase"), {
  loading: Preview,
});

const LandingOrganization = () => {
  const { user } = useAuthSession();
  return user?.role === "ORGANIZATION" ? <Live /> : <Preview />;
};
export default LandingOrganization;
