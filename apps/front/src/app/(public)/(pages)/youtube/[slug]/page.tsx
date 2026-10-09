import { getPublicYouTubeChannel } from "@/lib/server/public-content";
import { TContentDetailPageProps } from "@/types/pages.types";
import { getPublicYouTubeVideos } from "@/lib/server/public-content";
import { contentMetadata } from "@/lib/social-card/metadata";
import { notFound } from "next/navigation";

import YouTubeDetailPage from "@modules/ContentDetail/YoutubeDetail";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({
  params,
}: TContentDetailPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const channel = await getPublicYouTubeChannel(slug);
  if (!channel) notFound();
  return contentMetadata({
    kind: "youtube",
    slug: channel.slug,
    title: channel.title,
    description: channel.description,
  });
};

const Page = async ({ params }: TContentDetailPageProps) => {
  const { slug } = await params;
  const channel = await getPublicYouTubeChannel(slug);
  if (!channel) notFound();
  const videos = await getPublicYouTubeVideos(channel.id);
  return <YouTubeDetailPage channel={channel} videos={videos} />;
};

export default Page;
