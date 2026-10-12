import { providerPath, topicPath } from "@/lib/content-catalog/public-path";
import { normalizeDescription } from "@/lib/content-catalog/snippet";
import { nodeId, webPageNode } from "@/lib/structured-data/graph";
import { contentDetailPath } from "@/lib/content-catalog/detail-path";
import { breadcrumbNode } from "@/lib/structured-data/graph";
import { localizedUrl } from "@/lib/site/page-metadata";
import { plainText } from "@/lib/structured-data/facts";

import type { PublicProviderProfile } from "@/lib/server/public-content";
import type { PublicTopicHub } from "@/lib/server/public-content";
import type { PublicLocale } from "@/lib/i18n/locale";
import type { ContentKind } from "@/lib/content-catalog/detail-path";
import type { JsonLdNode } from "@/lib/structured-data/json-ld";
import type { Trail } from "@/lib/structured-data/trail";

const KIND_OF: Record<string, ContentKind> = {
  COURSE: "course",
  EVENT: "event",
  PODCAST: "podcast",
  YOUTUBE: "youtube",
};

type Input<TContent> = {
  content: TContent;
  locale: PublicLocale;
  trail: Trail;
};

export const topicHubGraph = ({
  content,
  locale,
  trail,
}: Input<PublicTopicHub>): JsonLdNode[] => {
  const path = topicPath(content.slug);
  const url = localizedUrl(path, locale);
  const listId = nodeId(url, "items");
  const elements = content.items.flatMap((item, index) => {
    const kind = KIND_OF[item.kind];
    return kind
      ? [
          {
            "@type": "ListItem",
            position: index + 1,
            name: plainText(item.title),
            url: localizedUrl(contentDetailPath(kind, item.slug), "en"),
          },
        ]
      : [];
  });
  return [
    webPageNode({
      path,
      name: content.title,
      locale,
      trail,
      type: "CollectionPage",
      description: normalizeDescription(content.introduction, ""),
      mainEntityId: elements.length > 0 ? listId : undefined,
    }),
    breadcrumbNode(url, trail, locale),
    ...(elements.length > 0
      ? [
          {
            "@type": "ItemList",
            "@id": listId,
            name: plainText(content.title),
            itemListElement: elements,
          } satisfies JsonLdNode,
        ]
      : []),
  ];
};

export const providerProfileGraph = ({
  content,
  locale,
  trail,
  logoUrl,
}: Input<PublicProviderProfile> & { logoUrl: string | null }): JsonLdNode[] => {
  const path = providerPath(content.slug);
  const url = localizedUrl(path, locale);
  const organizationId = nodeId(url, "provider");
  const sameAs = content.links.map((link) => link.url);
  return [
    webPageNode({
      path,
      name: content.displayName,
      locale,
      trail,
      description: normalizeDescription(content.biography, ""),
      mainEntityId: organizationId,
    }),
    breadcrumbNode(url, trail, locale),
    {
      "@type": "Organization",
      "@id": organizationId,
      name: plainText(content.displayName),
      description: plainText(normalizeDescription(content.biography, "")),
      url: content.websiteUrl ?? url,
      logo: logoUrl ?? undefined,
      sameAs: sameAs.length > 0 ? sameAs : undefined,
    },
  ];
};
