import { asPublicLocale, variantsOf } from "@/lib/i18n/route-locale";
import { TContentDetailPageProps } from "@/types/pages.types";
import { getPublicYouTubeChannel } from "@/lib/server/public-content";
import { getPublicYouTubeVideos } from "@/lib/server/public-content";
import { contentMetadata } from "@/lib/social-card/metadata";
import { noindexMetadata } from "@/lib/site/page-metadata";
import { notFound } from "next/navigation";

import YoutubeDetail from "@modules/ContentDetail/YoutubeDetail";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({
  params,
}: TContentDetailPageProps): Promise<Metadata> => {
  const { slug, locale } = await params;
  const publicLocale = asPublicLocale(locale);
  const channel = await getPublicYouTubeChannel(slug, publicLocale);
  if (!channel) return noindexMetadata();
  return contentMetadata({
    kind: "youtube",
    slug: channel.slug,
    title: channel.title,
    description: channel.description,
    locale: publicLocale,
    variants: variantsOf(channel.availableLocales),
  });
};

const Page = async ({ params }: TContentDetailPageProps) => {
  const { slug, locale } = await params;
  const channel = await getPublicYouTubeChannel(slug, asPublicLocale(locale));
  if (!channel) notFound();
  const videos = await getPublicYouTubeVideos(channel.id);
  return <YoutubeDetail channel={channel} videos={videos} />;
};

export default Page;
