import { asPublicLocale, variantsOf } from "@/lib/i18n/route-locale";
import { getPublicPodcastEpisodes } from "@/lib/server/public-content";
import { redirectToRenamedContent } from "@/lib/server/renamed-content";
import { TContentDetailPageProps } from "@/types/pages.types";
import { getPublicPodcast } from "@/lib/server/public-content";
import { contentMetadata } from "@/lib/social-card/metadata";
import { noindexMetadata } from "@/lib/site/page-metadata";
import { podcastGraph } from "@/lib/structured-data/detail-graphs";
import { detailTrail } from "@/lib/structured-data/trail";
import { notFound } from "next/navigation";

import PodcastDetailPage from "@modules/ContentDetail/PodcastDetailPage";
import Breadcrumbs from "@elements/breadcrumbs";
import JsonLd from "@elements/json-ld";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({
  params,
}: TContentDetailPageProps): Promise<Metadata> => {
  const { slug, locale } = await params;
  const publicLocale = asPublicLocale(locale);
  const podcast = await getPublicPodcast(slug, publicLocale);
  if (!podcast) return noindexMetadata();
  return contentMetadata({
    kind: "podcast",
    slug: podcast.slug,
    title: podcast.title,
    description: podcast.description,
    locale: publicLocale,
    variants: variantsOf(podcast.availableLocales),
    seo: podcast,
  });
};

const Page = async ({ params }: TContentDetailPageProps) => {
  const { slug, locale } = await params;
  const publicLocale = asPublicLocale(locale);
  const podcast = await getPublicPodcast(slug, publicLocale);
  if (!podcast) {
    await redirectToRenamedContent(
      "podcast",
      slug,
      publicLocale,
      getPublicPodcast,
    );
    notFound();
  }
  const episodes = await getPublicPodcastEpisodes(podcast.id);
  const trail = await detailTrail({
    kind: "podcast",
    slug: podcast.slug,
    title: podcast.title,
    locale: publicLocale,
  });
  return (
    <>
      {!podcast.excludeFromIndex && (
        <JsonLd
          nodes={podcastGraph({
            content: podcast,
            episodes,
            locale: publicLocale,
            trail,
          })}
        />
      )}
      <PodcastDetailPage
        podcast={podcast}
        episodes={episodes}
        breadcrumbs={<Breadcrumbs trail={trail} locale={publicLocale} />}
      />
    </>
  );
};

export default Page;
