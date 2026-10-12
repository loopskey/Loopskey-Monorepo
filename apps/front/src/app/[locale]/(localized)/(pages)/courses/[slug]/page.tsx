import { asPublicLocale, variantsOf } from "@/lib/i18n/route-locale";
import { redirectToRenamedContent } from "@/lib/server/renamed-content";
import { TContentDetailPageProps } from "@/types/pages.types";
import { getContentTopicHubs } from "@/lib/server/public-content";
import { getProviderByline } from "@/lib/server/public-content";
import { getPublicCourse } from "@/lib/server/public-content";
import { contentMetadata } from "@/lib/social-card/metadata";
import { noindexMetadata } from "@/lib/site/page-metadata";
import { courseGraph } from "@/lib/structured-data/detail-graphs";
import { detailTrail } from "@/lib/structured-data/trail";
import { notFound } from "next/navigation";

import CourseDetailPage from "@modules/ContentDetail/CourseDetailPage";
import ContentRelations from "@modules/Editorial/ContentRelations";
import Breadcrumbs from "@elements/breadcrumbs";
import JsonLd from "@elements/json-ld";

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
    seo: course,
  });
};

const Page = async ({ params }: TContentDetailPageProps) => {
  const { slug, locale } = await params;
  const publicLocale = asPublicLocale(locale);
  const course = await getPublicCourse(slug, publicLocale);
  if (!course) {
    await redirectToRenamedContent(
      "course",
      slug,
      publicLocale,
      getPublicCourse,
    );
    notFound();
  }
  const [hubs, byline] = await Promise.all([
    getContentTopicHubs("course", course.id, publicLocale),
    getProviderByline("course", course.id),
  ]);
  const trail = await detailTrail({
    kind: "course",
    slug: course.slug,
    title: course.title,
    locale: publicLocale,
  });
  return (
    <>
      {!course.excludeFromIndex && (
        <JsonLd
          nodes={courseGraph({ content: course, locale: publicLocale, trail })}
        />
      )}
      <CourseDetailPage
        course={course}
        breadcrumbs={
          <>
            <Breadcrumbs trail={trail} locale={publicLocale} />
            <ContentRelations
              hubs={hubs}
              byline={byline}
              locale={publicLocale}
            />
          </>
        }
      />
    </>
  );
};

export default Page;
