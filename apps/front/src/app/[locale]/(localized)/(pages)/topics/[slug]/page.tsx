import { asPublicLocale, variantsOf } from "@/lib/i18n/route-locale";
import { redirectToRenamedContent } from "@/lib/server/renamed-content";
import { TContentDetailPageProps } from "@/types/pages.types";
import { getPublicTopicHub } from "@/lib/server/public-content";
import { editorialMetadata } from "@/lib/site/editorial-metadata";
import { noindexMetadata } from "@/lib/site/page-metadata";
import { editorialTrail } from "@/lib/structured-data/trail";
import { loadDictionary } from "@/i18n/dictionaries";
import { topicHubGraph } from "@/lib/structured-data/editorial-graphs";
import { topicPath } from "@/lib/content-catalog/public-path";
import { notFound } from "next/navigation";

import type { Metadata } from "next";

import TopicHubPage from "@modules/Editorial/TopicHubPage";
import Breadcrumbs from "@elements/breadcrumbs";
import JsonLd from "@elements/json-ld";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({
  params,
}: TContentDetailPageProps): Promise<Metadata> => {
  const { slug, locale } = await params;
  const publicLocale = asPublicLocale(locale);
  const hub = await getPublicTopicHub(slug, publicLocale);
  if (!hub) return noindexMetadata();
  const dictionary = await loadDictionary(publicLocale);
  return editorialMetadata({
    path: topicPath(hub.slug),
    title: hub.title,
    description: hub.introduction,
    fallbackDescription: dictionary.topicHub.metaFallback,
    locale: publicLocale,
    variants: variantsOf(hub.availableLocales),
    excludeFromIndex: hub.excludeFromIndex,
  });
};

const Page = async ({ params }: TContentDetailPageProps) => {
  const { slug, locale } = await params;
  const publicLocale = asPublicLocale(locale);
  const hub = await getPublicTopicHub(slug, publicLocale);
  if (!hub) {
    await redirectToRenamedContent(
      "topic",
      slug,
      publicLocale,
      getPublicTopicHub,
    );
    notFound();
  }
  const trail = await editorialTrail({
    kind: "topic",
    slug: hub.slug,
    title: hub.title,
    locale: publicLocale,
  });
  return (
    <>
      {!hub.excludeFromIndex && (
        <JsonLd
          nodes={topicHubGraph({ content: hub, locale: publicLocale, trail })}
        />
      )}
      <TopicHubPage
        hub={hub}
        locale={publicLocale}
        breadcrumbs={<Breadcrumbs trail={trail} locale={publicLocale} />}
      />
    </>
  );
};

export default Page;
