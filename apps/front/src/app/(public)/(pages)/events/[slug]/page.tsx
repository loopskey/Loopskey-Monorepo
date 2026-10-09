import { TContentDetailPageProps } from "@/types/pages.types";
import { contentMetadata } from "@/lib/social-card/metadata";
import { getPublicEvent } from "@/lib/server/public-content";
import { notFound } from "next/navigation";

import EventDetailPage from "@modules/ContentDetail/EventDetailPage";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({
  params,
}: TContentDetailPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const event = await getPublicEvent(slug);
  if (!event) notFound();
  return contentMetadata({
    kind: "event",
    slug: event.slug,
    title: event.title,
    description: event.description,
  });
};

const Page = async ({ params }: TContentDetailPageProps) => {
  const { slug } = await params;
  const event = await getPublicEvent(slug);
  if (!event) notFound();
  return <EventDetailPage event={event} />;
};

export default Page;
