export const ROADMAP_TAB_HREF = "/dashboard/professional?tab=roadmap";
export const ROADMAP_CHAT_HREF = "/dashboard/professional/roadmap-chat";

export const buildRoadmapTabHref = (roadmapId: string) =>
  `${ROADMAP_TAB_HREF}&roadmapId=${encodeURIComponent(roadmapId)}`;

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

export const buildRoadmapEditHref = (draftId: string) =>
  `${ROADMAP_CHAT_HREF}?draftId=${encodeURIComponent(draftId)}&focus=preferences`;

export const ROADMAP_NEXT_STEP_ELEMENT_ID = "roadmap-next-step";
