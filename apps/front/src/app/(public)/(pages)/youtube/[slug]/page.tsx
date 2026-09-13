import { TContentDetailPageProps } from "@/types/pages.types";
import { contentSocialMetadata } from "@/lib/social-card/metadata";

import YouTubeDetailPage from "@modules/ContentDetail/YoutubeDetail";

import type { Metadata } from "next";

export const generateMetadata = async ({
  params,
}: TContentDetailPageProps): Promise<Metadata> => {
  const { slug } = await params;
  return contentSocialMetadata("youtube", slug);
};

const Page = async ({ params }: TContentDetailPageProps) => {
  const { slug } = await params;
  return <YouTubeDetailPage slug={slug} />;
};

export default Page;
