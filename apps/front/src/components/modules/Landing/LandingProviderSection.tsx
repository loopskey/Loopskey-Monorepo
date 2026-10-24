"use client";

import { useLandingProviderShowcase } from "@hooks/useLandingProvider";
import { useAuthSession } from "@/hooks/useAuthSession";

import LandingProviderView from "./LandingProviderSectionView";
import dynamic from "next/dynamic";

const Preview = () => (
  <LandingProviderView model={useLandingProviderShowcase()} />
);
const Live = dynamic(() => import("./provider-live-showcase"), {
  loading: Preview,
});

const LandingProvider = () => {
  const { user } = useAuthSession();
  return user?.role === "PROVIDER" ? <Live /> : <Preview />;
};
export default LandingProvider;
