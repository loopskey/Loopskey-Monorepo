"use client";

import { CheckCircle2, Clock3, GraduationCap, Users } from "lucide-react";
import { CalendarEventType, ContentType, PduSource } from "@/lib/graphql/base";
import { TCourseDetailPageProps } from "@/types/content-module.types";
import { formatDurationMinutes } from "@/utils/content-source.helper";
import { resolveExternalUrl } from "@/utils/content-source.helper";
import { useContentActions } from "@/hooks/useContentActions";
import { formatPriceLabel } from "@/utils/content-source.helper";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";

import DetailSidebarActions from "@modules/ContentDetail/parts/DetailSidebarActions";
import DetailPageHeader from "@modules/ContentDetail/parts/DetailPageHeader";
import DetailSkeleton from "@modules/ContentDetail/parts/DetailSkeleton";
import DetailSidebar from "@modules/ContentDetail/parts/DetailSidebar";
import DetailSummary from "@modules/ContentDetail/parts/DetailSummary";
import DetailSection from "@modules/ContentDetail/parts/DetailSection";
import DetailLayout from "@modules/ContentDetail/parts/DetailLayout";

import * as CourseApi from "@/lib/rtk/endpoints/course.api";

const CourseDetailPage = ({ slug }: TCourseDetailPageProps) => {
  const { t } = useI18n();

  const { data: course, isLoading } = CourseApi.useCourseBySlugQuery({
    slug,
  });

  const actions = useContentActions({
    skipReviews: true,
    skipEnrollment: true,
    contentId: course?.id,
    contentType: ContentType.Course,
  });

  if (isLoading) return <DetailSkeleton />;

  if (!course) {
    return (
      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <GlassCard className="mx-auto max-w-3xl p-10 text-center" glow={false}>
          <div className="relative z-10">
            <h1 className="text-2xl font-medium">
              {t("contentDetails.common.notFound")}
            </h1>
          </div>
        </GlassCard>
      </main>
    );
  }

  const learnings = course.learnings ?? [];
  const requirements = course.requirements ?? [];

  return (
    <DetailLayout
      header={
        <DetailPageHeader
          title={course.title}
          rating={course.rating}
          category={course.category}
          ratingCount={course.ratingCount}
          badge={t("contentDetails.course.badge")}
          byline={
            course.instructor
              ? t("contentDetails.course.byInstructor", {
                  name: course.instructor,
                })
              : null
          }
        />
      }
      sidebar={
        <DetailSidebar
          id={course.id}
          kind="course"
          title={course.title}
          imageUrl={course.imageUrl}
          category={course.category}
          summary={
            <DetailSummary
              items={[
                {
                  key: "price",
                  label: t("contentDetails.common.price"),
                  value: formatPriceLabel(
                    t("contentDetails.common.free"),
                    course.price,
                    course.currency,
                    course.isFree,
                  ),
                },
              ]}
            />
          }
          actions={
            <DetailSidebarActions
              contentType={ContentType.Course}
              contentUrl={resolveExternalUrl(course.sourceUrl)}
              wishlist={{
                isWishlisted: actions.isWishlisted,
                loading: actions.isWishlistLoading,
                onToggle: actions.onToggleWishlist,
              }}
              prefill={{
                title: course.title,
                type: CalendarEventType.Course,
                contentId: course.id,
                contentType: ContentType.Course,
              }}
              completed={{
                title: course.title,
                contentId: course.id,
                contentType: ContentType.Course,
                activityType: PduSource.Course,
                providerOrganizer: course.instructor,
                durationMinutes: course.durationMinutes,
                level: course.level,
              }}
            />
          }
          facts={[
            {
              key: "level",
              value: course.level,
              label: t("contentDetails.course.level"),
              icon: <GraduationCap className="h-4 w-4" />,
            },
            {
              key: "duration",
              label: t("contentDetails.course.duration"),
              value: formatDurationMinutes(course.durationMinutes),
              icon: <Clock3 className="h-4 w-4" />,
            },
            {
              key: "professionals",
              value: course.professionals || null,
              label: t("contentDetails.course.professionals"),
              icon: <Users className="h-4 w-4" />,
            },
          ]}
        />
      }
    >
      {course.description && (
        <DetailSection title={t("contentDetails.course.about")}>
          <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-base">
            {course.description}
          </p>
        </DetailSection>
      )}

      {learnings.length > 0 && (
        <DetailSection title={t("contentDetails.course.whatYouWillLearn")}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {learnings.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <CheckCircle2
                  aria-hidden
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </DetailSection>
      )}

      {requirements.length > 0 && (
        <DetailSection title={t("contentDetails.course.requirements")}>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground marker:text-primary">
            {requirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </DetailSection>
      )}
    </DetailLayout>
  );
};

export default CourseDetailPage;
