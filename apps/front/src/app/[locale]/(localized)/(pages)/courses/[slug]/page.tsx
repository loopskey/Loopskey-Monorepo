import { TContentDetailPageProps } from "@/types/pages.types";
import { getPublicCourse } from "@/lib/server/public-content";
import { asPublicLocale, variantsOf } from "@/lib/i18n/route-locale";
import { contentMetadata } from "@/lib/social-card/metadata";
import { noindexMetadata } from "@/lib/site/page-metadata";
import { notFound } from "next/navigation";

import CourseDetailPage from "@modules/ContentDetail/CourseDetailPage";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({
  params,
}: TContentDetailPageProps): Promise<Metadata> => {
  const { slug, locale } = await params;
  const publicLocale = asPublicLocale(locale);
  const course = await getPublicCourse(slug, publicLocale);
  if (!course) return noindexMetadata();
  return contentMetadata({
    kind: "course",
    slug: course.slug,
    title: course.title,
    description: course.description,
    locale: publicLocale,
    variants: variantsOf(course.availableLocales),
  });
};

const Page = async ({ params }: TContentDetailPageProps) => {
  const { slug, locale } = await params;
  const course = await getPublicCourse(slug, asPublicLocale(locale));
  if (!course) notFound();
  return <CourseDetailPage course={course} />;
};

export default Page;
