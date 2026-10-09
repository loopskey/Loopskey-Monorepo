import { getPublicPodcastEpisodes } from "@/lib/server/public-content";
import { TContentDetailPageProps } from "@/types/pages.types";
import { getPublicPodcast } from "@/lib/server/public-content";
import { contentMetadata } from "@/lib/social-card/metadata";
import { notFound } from "next/navigation";

import PodcastDetailPage from "@modules/ContentDetail/PodcastDetailPage";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({
  params,
}: TContentDetailPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const podcast = await getPublicPodcast(slug);
  if (!podcast) notFound();
  return contentMetadata({
    kind: "podcast",
    slug: podcast.slug,
    title: podcast.title,
    description: podcast.description,
  });
};

const Page = async ({ params }: TContentDetailPageProps) => {
  const { slug } = await params;
  const podcast = await getPublicPodcast(slug);
  if (!podcast) notFound();
  const episodes = await getPublicPodcastEpisodes(podcast.id);
  return <PodcastDetailPage podcast={podcast} episodes={episodes} />;
};

export default Page;
