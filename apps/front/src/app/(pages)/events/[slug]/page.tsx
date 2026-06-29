import { TContentDetailPageProps } from "@/types/pages.types";

import EventDetailPage from "@modules/ContentDetail/EventDetailPage";

const Page = async ({ params }: TContentDetailPageProps) => {
  const { slug } = await params;
  return <EventDetailPage slug={slug} />;
};

export default Page;
