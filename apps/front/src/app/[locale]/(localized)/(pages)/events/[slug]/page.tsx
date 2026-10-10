import { TContentDetailPageProps } from "@/types/pages.types";
import { getPublicEvent } from "@/lib/server/public-content";
import { asPublicLocale, variantsOf } from "@/lib/i18n/route-locale";
import { contentMetadata } from "@/lib/social-card/metadata";
import { noindexMetadata } from "@/lib/site/page-metadata";
import { notFound } from "next/navigation";

import EventDetailPage from "@modules/ContentDetail/EventDetailPage";

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
  });
};

const Page = async ({ params }: TContentDetailPageProps) => {
  const { slug, locale } = await params;
  const event = await getPublicEvent(slug, asPublicLocale(locale));
  if (!event) notFound();
  return <EventDetailPage event={event} />;
};

export default Page;
