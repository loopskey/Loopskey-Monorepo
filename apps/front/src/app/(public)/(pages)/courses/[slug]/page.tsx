import { TContentDetailPageProps } from "@/types/pages.types";
import { getPublicCourse } from "@/lib/server/public-content";
import { contentMetadata } from "@/lib/social-card/metadata";
import { notFound } from "next/navigation";

import CourseDetailPage from "@modules/ContentDetail/CourseDetailPage";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({
  params,
}: TContentDetailPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const course = await getPublicCourse(slug);
  if (!course) notFound();
  return contentMetadata({
    kind: "course",
    slug: course.slug,
    title: course.title,
    description: course.description,
  });
};

const Page = async ({ params }: TContentDetailPageProps) => {
  const { slug } = await params;
  const course = await getPublicCourse(slug);
  if (!course) notFound();
  return <CourseDetailPage course={course} />;
};

export default Page;
