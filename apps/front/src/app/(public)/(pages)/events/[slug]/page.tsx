import { TContentDetailPageProps } from "@/types/pages.types";
import { contentSocialMetadata } from "@/lib/social-card/metadata";

import EventDetailPage from "@modules/ContentDetail/EventDetailPage";

import type { Metadata } from "next";

export const generateMetadata = async ({
  params,
}: TContentDetailPageProps): Promise<Metadata> => {
  const { slug } = await params;
  return contentSocialMetadata("event", slug);
};

const Page = async ({ params }: TContentDetailPageProps) => {
  const { slug } = await params;
  return <EventDetailPage slug={slug} />;
};

export default Page;
