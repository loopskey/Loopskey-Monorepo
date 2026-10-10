import { TContentDetailPageProps } from "@/types/pages.types";
import { getPublicPodcastEpisodes } from "@/lib/server/public-content";
import { getPublicPodcast } from "@/lib/server/public-content";
import { asPublicLocale, variantsOf } from "@/lib/i18n/route-locale";
import { contentMetadata } from "@/lib/social-card/metadata";
import { noindexMetadata } from "@/lib/site/page-metadata";
import { notFound } from "next/navigation";

import PodcastDetailPage from "@modules/ContentDetail/PodcastDetailPage";

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
  });
};

const Page = async ({ params }: TContentDetailPageProps) => {
  const { slug, locale } = await params;
  const podcast = await getPublicPodcast(slug, asPublicLocale(locale));
  if (!podcast) notFound();
  const episodes = await getPublicPodcastEpisodes(podcast.id);
  return <PodcastDetailPage podcast={podcast} episodes={episodes} />;
};

export default Page;
