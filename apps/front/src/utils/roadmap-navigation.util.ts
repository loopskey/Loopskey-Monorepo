export const ROADMAP_TAB_HREF = "/dashboard/professional?tab=roadmap";
export const ROADMAP_HERO_HASH = "#your-learning-path";
export const ROADMAP_PHASES_HASH = "#your-learning-path-phases";
export const ROADMAP_STEP_ID_PREFIX = "roadmap-step-";

export const roadmapStepElementId = (stepId: string) =>
  `${ROADMAP_STEP_ID_PREFIX}${stepId}`;

export const buildRoadmapHref = (roadmapId: string, stepId?: string | null) => {
  const params = new URLSearchParams({ tab: "roadmap", roadmapId });
  if (stepId) params.set("stepId", stepId);
  return `/dashboard/professional?${params.toString()}${ROADMAP_PHASES_HASH}`;
};

const CONTENT_ROUTE_BY_TYPE: Record<string, string> = {
  COURSE: "/courses",
  EVENT: "/events",
  PODCAST: "/podcasts",
  YOUTUBE: "/youtube",
};

export const roadmapContentHref = (
  contentType?: string | null,
  contentSlug?: string | null,
) => {
  const route = contentType ? CONTENT_ROUTE_BY_TYPE[contentType] : undefined;
  return route && contentSlug
    ? `${route}/${encodeURIComponent(contentSlug)}`
    : null;
};
