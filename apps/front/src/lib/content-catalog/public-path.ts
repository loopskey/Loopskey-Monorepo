import { contentDetailPath } from "@/lib/content-catalog/detail-path";

import type { ContentKind } from "@/lib/content-catalog/detail-path";

export type EditorialKind = "topic" | "provider";

export type PublicPageKind = ContentKind | EditorialKind;

const EDITORIAL_PATH: Record<EditorialKind, string> = {
  topic: "/topics",
  provider: "/providers",
};

export const topicPath = (slug: string) =>
  `${EDITORIAL_PATH.topic}/${encodeURIComponent(slug)}`;

export const providerPath = (slug: string) =>
  `${EDITORIAL_PATH.provider}/${encodeURIComponent(slug)}`;

export const publicPagePath = (kind: PublicPageKind, slug: string) =>
  kind === "topic" || kind === "provider"
    ? `${EDITORIAL_PATH[kind]}/${encodeURIComponent(slug)}`
    : contentDetailPath(kind, slug);
