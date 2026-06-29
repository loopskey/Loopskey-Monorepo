import { TContentDetailPageProps } from "@/types/pages.types";

import PodcastDetailPage from "@modules/ContentDetail/PodcastDetailPage";

const Page = async ({ params }: TContentDetailPageProps) => {
  const { slug } = await params;
  return <PodcastDetailPage slug={slug} />;
};

export default Page;
