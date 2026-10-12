import { asPublicLocale, variantsOf } from "@/lib/i18n/route-locale";
import { redirectToRenamedContent } from "@/lib/server/renamed-content";
import { TContentDetailPageProps } from "@/types/pages.types";
import { getContentTopicHubs } from "@/lib/server/public-content";
import { getProviderByline } from "@/lib/server/public-content";
import { contentMetadata } from "@/lib/social-card/metadata";
import { noindexMetadata } from "@/lib/site/page-metadata";
import { getPublicEvent } from "@/lib/server/public-content";
import { detailTrail } from "@/lib/structured-data/trail";
import { eventGraph } from "@/lib/structured-data/detail-graphs";
import { notFound } from "next/navigation";

import ContentRelations from "@modules/Editorial/ContentRelations";
import EventDetailPage from "@modules/ContentDetail/EventDetailPage";
import Breadcrumbs from "@elements/breadcrumbs";
import JsonLd from "@elements/json-ld";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({
  params,
}: TContentDetailPageProps): Promise<Metadata> => {
  const { slug, locale } = await params;
  const publicLocale = asPublicLocale(locale);
  const event = await getPublicEvent(slug, publicLocale);
  if (!event) return noindexMetadata();
  return contentMetadata({
    kind: "event",
    slug: event.slug,
    title: event.title,
    description: event.description,
    locale: publicLocale,
    variants: variantsOf(event.availableLocales),
    seo: event,
  });
};

const Page = async ({ params }: TContentDetailPageProps) => {
  const { slug, locale } = await params;
  const publicLocale = asPublicLocale(locale);
  const event = await getPublicEvent(slug, publicLocale);
  if (!event) {
    await redirectToRenamedContent("event", slug, publicLocale, getPublicEvent);
    notFound();
  }
  const [hubs, byline] = await Promise.all([
    getContentTopicHubs("event", event.id, publicLocale),
    getProviderByline("event", event.id),
  ]);
  const trail = await detailTrail({
    kind: "event",
    slug: event.slug,
    title: event.title,
    locale: publicLocale,
  });
  return (
    <>
      {!event.excludeFromIndex && (
        <JsonLd
          nodes={eventGraph({ content: event, locale: publicLocale, trail })}
        />
      )}
      <EventDetailPage
        event={event}
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
