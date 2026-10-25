import { getDashboardPath, siteLinks } from "@/utils/site-navigation";
import { ROADMAP_TAB_HREF } from "@/utils/roadmap-navigation.util";

import type { Role } from "@/lib/graphql/base";

export type LandingSessionIntent = "account" | "start" | "roadmap";

export type LandingSessionAction = {
  href: string;
  labelKey: string;
};

const ANONYMOUS_LABEL_KEY: Record<LandingSessionIntent, string> = {
  account: "landing.actions.createAccount",
  start: "landing.actions.getStarted",
  roadmap: "landing.actions.buildRoadmap",
};

export const anonymousLandingLabelKey = (intent: LandingSessionIntent) =>
  ANONYMOUS_LABEL_KEY[intent];

export const resolveLandingSessionAction = (
  intent: LandingSessionIntent,
  role: Role | null,
): LandingSessionAction => {
  if (!role) {
    return { href: siteLinks.login, labelKey: ANONYMOUS_LABEL_KEY[intent] };
  }
  if (intent !== "roadmap") {
    return {
      href: getDashboardPath(role),
      labelKey: "landing.actions.dashboard",
    };
  }
  if (role === "PROFESSIONAL") {
    return { href: ROADMAP_TAB_HREF, labelKey: "landing.actions.buildRoadmap" };
  }
  return {
    href: siteLinks.professionals,
    labelKey: "landing.actions.roadmapForProfessionals",
  };
};
