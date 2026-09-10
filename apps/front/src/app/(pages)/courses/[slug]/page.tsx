import { TContentDetailPageProps } from "@/types/pages.types";
import { contentSocialMetadata } from "@/lib/social-card/metadata";

import CourseDetailPage from "@modules/ContentDetail/CourseDetailPage";

import type { Metadata } from "next";

export const generateMetadata = async ({
  params,
}: TContentDetailPageProps): Promise<Metadata> => {
  const { slug } = await params;
  return contentSocialMetadata("course", slug);
};

const Course = async ({ params }: TContentDetailPageProps) => {
  const { slug } = await params;
  return <CourseDetailPage slug={slug} />;
};

export default Course;
