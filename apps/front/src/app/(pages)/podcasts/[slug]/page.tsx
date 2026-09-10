import { TContentDetailPageProps } from "@/types/pages.types";
import { contentSocialMetadata } from "@/lib/social-card/metadata";

import PodcastDetailPage from "@modules/ContentDetail/PodcastDetailPage";

import type { Metadata } from "next";

export const generateMetadata = async ({
  params,
}: TContentDetailPageProps): Promise<Metadata> => {
  const { slug } = await params;
  return contentSocialMetadata("podcast", slug);
};

const Page = async ({ params }: TContentDetailPageProps) => {
  const { slug } = await params;
  return <PodcastDetailPage slug={slug} />;
};

export default Page;
