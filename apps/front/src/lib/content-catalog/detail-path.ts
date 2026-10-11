export type ContentKind = "course" | "event" | "podcast" | "youtube";

const KIND_PATH: Record<ContentKind, string> = {
  course: "/courses",
  event: "/events",
  podcast: "/podcasts",
  youtube: "/youtube",
};

export const contentDetailPath = (kind: ContentKind, slug: string) =>
  `${KIND_PATH[kind]}/${encodeURIComponent(slug)}`;
