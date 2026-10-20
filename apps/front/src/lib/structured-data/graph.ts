import { localizedUrl } from "@/lib/site/page-metadata";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site/page-metadata";
import { STATIC_INFO_EMAIL } from "@/utils/static-info-outline";
import { siteUrl } from "@/lib/site/site-url";
import { plainText } from "@/lib/structured-data/facts";

import type { PublicLocale } from "@/lib/i18n/locale";
import type { JsonLdNode } from "@/lib/structured-data/json-ld";
import type { Trail } from "@/lib/structured-data/trail";

const ORGANIZATION_LOGO_PATH = "/brand-logo-512.png";
const ORGANIZATION_LOGO_SIZE = 512;

export const nodeId = (url: string, fragment: string) => `${url}#${fragment}`;

const reference = (id: string): JsonLdNode => ({ "@id": id });

const organizationId = () => nodeId(siteUrl("/"), "organization");

const websiteId = () => nodeId(siteUrl("/"), "website");

export const organizationNode = (): JsonLdNode => ({
  "@type": "Organization",
  "@id": organizationId(),
  name: SITE_NAME,
  url: siteUrl("/"),
  description: SITE_DESCRIPTION,
  logo: {
    "@type": "ImageObject",
    "@id": nodeId(siteUrl("/"), "logo"),
    url: siteUrl(ORGANIZATION_LOGO_PATH),
    width: ORGANIZATION_LOGO_SIZE,
    height: ORGANIZATION_LOGO_SIZE,
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: STATIC_INFO_EMAIL,
    availableLanguage: ["en", "fr"],
  },
});

export const websiteNode = (): JsonLdNode => ({
  "@type": "WebSite",
  "@id": websiteId(),
  url: siteUrl("/"),
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  inLanguage: ["en", "fr"],
  publisher: reference(organizationId()),
});

export const breadcrumbNode = (
  pageUrl: string,
  trail: Trail,
  locale: PublicLocale,
): JsonLdNode => ({
  "@type": "BreadcrumbList",
  "@id": nodeId(pageUrl, "breadcrumb"),
  itemListElement: trail.items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: localizedUrl(item.path, locale),
  })),
});

type WebPageInput = {
  path: string;
  name: string;
  locale: PublicLocale;
  description?: string | null;
  type?: "WebPage" | "AboutPage" | "CollectionPage";
  trail?: Trail;
  mainEntityId?: string;
  about?: JsonLdNode;
};

export const webPageNode = ({
  path,
  name,
  locale,
  description,
  trail,
  mainEntityId,
  about,
  type = "WebPage",
}: WebPageInput): JsonLdNode => {
  const url = localizedUrl(path, locale);
  return {
    "@type": type,
    "@id": nodeId(url, "webpage"),
    url,
    name: plainText(name),
    description: plainText(description),
    inLanguage: locale,
    isPartOf: reference(websiteId()),
    breadcrumb: trail ? reference(nodeId(url, "breadcrumb")) : undefined,
    mainEntity: mainEntityId ? reference(mainEntityId) : undefined,
    about,
  };
};

export const identityGraph = ({
  path,
  name,
  locale,
  description,
  type,
}: Pick<
  WebPageInput,
  "path" | "name" | "locale" | "description" | "type"
>): JsonLdNode[] => [
  organizationNode(),
  websiteNode(),
  webPageNode({
    path,
    name,
    locale,
    description,
    type,
    about: reference(organizationId()),
  }),
];
