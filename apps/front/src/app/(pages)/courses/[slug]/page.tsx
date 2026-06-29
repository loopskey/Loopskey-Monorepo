import { TContentDetailPageProps } from "@/types/pages.types";

import CourseDetailPage from "@modules/ContentDetail/CourseDetailPage";

const Course = async ({ params }: TContentDetailPageProps) => {
  const { slug } = await params;
  return <CourseDetailPage slug={slug} />;
};

export default Course;
