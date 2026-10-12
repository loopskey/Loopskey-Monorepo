import { asPublicLocale, variantsOf } from "@/lib/i18n/route-locale";
import { redirectToRenamedContent } from "@/lib/server/renamed-content";
import { TContentDetailPageProps } from "@/types/pages.types";
import { getPublicYouTubeChannel } from "@/lib/server/public-content";
import { getPublicYouTubeVideos } from "@/lib/server/public-content";
import { getContentTopicHubs } from "@/lib/server/public-content";
import { getProviderByline } from "@/lib/server/public-content";
import { DetailOpenTracker } from "@elements/detail-open-tracker";
import { contentMetadata } from "@/lib/social-card/metadata";
import { noindexMetadata } from "@/lib/site/page-metadata";
import { channelGraph } from "@/lib/structured-data/detail-graphs";
import { detailTrail } from "@/lib/structured-data/trail";
import { ContentType } from "@/lib/graphql/base";
import { notFound } from "next/navigation";

import type { Metadata } from "next";

import ContentRelations from "@modules/Editorial/ContentRelations";
import YoutubeDetail from "@modules/ContentDetail/YoutubeDetail";
import Breadcrumbs from "@elements/breadcrumbs";
import JsonLd from "@elements/json-ld";

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
    seo: channel,
  });
};

const Page = async ({ params }: TContentDetailPageProps) => {
  const { slug, locale } = await params;
  const publicLocale = asPublicLocale(locale);
  const channel = await getPublicYouTubeChannel(slug, publicLocale);
  if (!channel) {
    await redirectToRenamedContent(
      "youtube",
      slug,
      publicLocale,
      getPublicYouTubeChannel,
    );
    notFound();
  }
  const videos = await getPublicYouTubeVideos(channel.id);
  const [hubs, byline] = await Promise.all([
    getContentTopicHubs("youtube", channel.id, publicLocale),
    getProviderByline("youtube", channel.id),
  ]);
  const trail = await detailTrail({
    kind: "youtube",
    slug: channel.slug,
    title: channel.title,
    locale: publicLocale,
  });
  return (
    <>
      <DetailOpenTracker contentType={ContentType.Youtube} />
      {!channel.excludeFromIndex && (
        <JsonLd
          nodes={channelGraph({
            content: channel,
            locale: publicLocale,
            trail,
          })}
        />
      )}
      <YoutubeDetail
        channel={channel}
        videos={videos}
        breadcrumbs={
          <>
            <Breadcrumbs trail={trail} locale={publicLocale} />
            <ContentRelations
              hubs={hubs}
              byline={byline}
              locale={publicLocale}
            />
          </>
        }
      />
    </>
  );
};

export default Page;
