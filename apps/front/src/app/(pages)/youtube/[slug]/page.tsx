import { TContentDetailPageProps } from "@/types/pages.types";

import YouTubeDetailPage from "@modules/ContentDetail/YoutubeDetail";

const Page = async ({ params }: TContentDetailPageProps) => {
  const { slug } = await params;
  return <YouTubeDetailPage slug={slug} />;
};

export default Page;
