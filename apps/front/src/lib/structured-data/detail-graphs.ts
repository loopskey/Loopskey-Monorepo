import { breadcrumbNode, webPageNode } from "@/lib/structured-data/graph";
import { channelNode, courseNode } from "@/lib/structured-data/entities";
import { eventNode, podcastNodes } from "@/lib/structured-data/entities";
import { normalizeDescription } from "@/lib/content-catalog/snippet";
import { contentDetailPath } from "@/lib/content-catalog/detail-path";
import { localizedUrl } from "@/lib/site/page-metadata";

import type { PublicCourse, PublicEvent } from "@/lib/server/public-content";
import type { PublicPodcastEpisode } from "@/lib/server/public-content";
import type { PublicYouTubeChannel } from "@/lib/server/public-content";
import type { SocialCardKind } from "@/lib/social-card/content";
import type { PublicPodcast } from "@/lib/server/public-content";
import type { PublicLocale } from "@/lib/i18n/locale";
import type { JsonLdNode } from "@/lib/structured-data/json-ld";
import type { Trail } from "@/lib/structured-data/trail";

type DetailGraphInput = {
  slug: string;
  trail: Trail;
  title: string;
  kind: SocialCardKind;
  locale: PublicLocale;
  description?: string | null;
};

const detailGraph = (
  { kind, slug, title, description, locale, trail }: DetailGraphInput,
  entities: JsonLdNode[],
): JsonLdNode[] => {
  const path = contentDetailPath(kind, slug);
  const url = localizedUrl(path, locale);
  const [mainEntity] = entities;
  return [
    webPageNode({
      path,
      name: title,
      locale,
      trail,
      description: normalizeDescription(description, ""),
      mainEntityId: mainEntity?.["@id"] as string | undefined,
    }),
    breadcrumbNode(url, trail, locale),
    ...entities,
  ];
};

type Input<TContent> = Omit<
  DetailGraphInput,
  "kind" | "slug" | "title" | "description"
> & {
  content: TContent;
};

const urlOf = (kind: SocialCardKind, slug: string, locale: PublicLocale) =>
  localizedUrl(contentDetailPath(kind, slug), locale);

export const courseGraph = ({ content, locale, trail }: Input<PublicCourse>) =>
  detailGraph({ ...content, kind: "course", locale, trail }, [
    courseNode(content, urlOf("course", content.slug, locale)),
  ]);

export const eventGraph = ({ content, locale, trail }: Input<PublicEvent>) => {
  const node = eventNode(content, urlOf("event", content.slug, locale));
  if (!node)
    console.warn(
      JSON.stringify({
        event: "structured-data.omitted",
        kind: "event",
        locale,
        reason: "missing-start-date",
      }),
    );
  return detailGraph(
    { ...content, kind: "event", locale, trail },
    node ? [node] : [],
  );
};

type PodcastInput = Input<PublicPodcast> & {
  episodes: readonly PublicPodcastEpisode[];
};

export const podcastGraph = ({
  trail,
  locale,
  content,
  episodes,
}: PodcastInput) =>
  detailGraph(
    { ...content, kind: "podcast", locale, trail },
    podcastNodes(content, episodes, urlOf("podcast", content.slug, locale)),
  );

export const channelGraph = ({
  content,
  locale,
  trail,
}: Input<PublicYouTubeChannel>) =>
  detailGraph({ ...content, kind: "youtube", locale, trail }, [
    channelNode(content, urlOf("youtube", content.slug, locale)),
  ]);
