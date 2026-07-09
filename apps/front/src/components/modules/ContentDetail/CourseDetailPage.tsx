"use client";

import { BookOpen, Clock3, GraduationCap, UserPlus, Users } from "lucide-react";
import { TCourseDetailPageProps } from "@/types/content-module.types";
import { useContentActions } from "@/hooks/useContentActions";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";

import DetailHeroActions from "@modules/ContentDetail/parts/DetailHeroActions";
import DetailActionPanel from "@modules/ContentDetail/parts/DetailActionPanel";
import CourseCurriculum from "@modules/ContentDetail/parts/CourseCurriculum";
import DetailSkeleton from "@modules/ContentDetail/parts/DetailSkeleton";
import DetailMetaPill from "@modules/ContentDetail/parts/DetailMetaPill";
import ReviewsList from "@modules/ContentDetail/parts/ReviewList";
import ReviewForm from "@modules/ContentDetail/parts/ReviewForm";
import DetailHero from "@modules/ContentDetail/parts/DetailHero";

import * as CourseApi from "@/lib/rtk/endpoints/course.api";
import * as Tabs from "@ui/tabs";
import * as API from "@/lib/graphql/generated";

const CourseDetailPage = ({ slug }: TCourseDetailPageProps) => {
  const { t } = useI18n();

  const { data: course, isLoading } = CourseApi.useCourseBySlugQuery({
    slug,
  });

  const actions = useContentActions({
    contentType: API.ContentType.Course,
    contentId: course?.id,
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

  const calendarPrefill = {
    title: course.title,
    type: API.CalendarEventType.Course,
    contentId: course.id,
    contentType: API.ContentType.Course,
  };

  const isPaid = !course.isFree && Number(course.price ?? 0) > 0;

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <DetailHero
          title={course.title}
          rating={course.rating}
          imageUrl={course.imageUrl}
          category={course.category}
          ratingCount={course.ratingCount}
          description={course.description}
          badge={t("contentDetails.course.badge")}
          actions={
            <DetailHeroActions
              contentType={API.ContentType.Course}
              prefill={calendarPrefill}
              wishlist={{
                isWishlisted: actions.isWishlisted,
                loading: actions.isWishlistLoading,
                onToggle: actions.onToggleWishlist,
              }}
              primary={{
                label: t("contentDetails.course.enrollNow"),
                doneLabel: t("contentDetails.actions.enrolled"),
                done: actions.isEnrolled,
                loading: actions.isEnrollLoading,
                onClick: actions.onEnroll,
                icon: <UserPlus className="h-4 w-4" />,
              }}
            />
          }
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DetailMetaPill
              value={course.professionals}
              icon={<Users className="h-4 w-4" />}
              label={t("contentDetails.course.professionals")}
            />
            <DetailMetaPill
              icon={<Clock3 className="h-4 w-4" />}
              label={t("contentDetails.course.duration")}
              value={
                course.durationMinutes
                  ? t("contentDetails.common.minutes", {
                      count: course.durationMinutes,
                    })
                  : null
              }
            />
            <DetailMetaPill
              value={course.level}
              label={t("contentDetails.course.level")}
              icon={<GraduationCap className="h-4 w-4" />}
            />
            <DetailMetaPill
              value={course.instructor}
              icon={<BookOpen className="h-4 w-4" />}
              label={t("contentDetails.course.instructor")}
            />
          </div>
        </DetailHero>

        <div
          className={`grid gap-6 ${
            isPaid ? "lg:grid-cols-[minmax(0,1fr)_360px]" : ""
          }`}
        >
          <section className="min-w-0">
            <Tabs.Tabs defaultValue="overview" className="space-y-6">
              <Tabs.TabsList className="grid h-auto grid-cols-3 rounded-3xl border border-glass-border bg-background/60 p-2 backdrop-blur-xl">
                <Tabs.TabsTrigger
                  value="overview"
                  className="rounded-2xl py-3 font-bold"
                >
                  {t("contentDetails.tabs.overview")}
                </Tabs.TabsTrigger>
                <Tabs.TabsTrigger
                  value="curriculum"
                  className="rounded-2xl py-3 font-bold"
                >
                  {t("contentDetails.tabs.curriculum")}
                </Tabs.TabsTrigger>
                <Tabs.TabsTrigger
                  value="reviews"
                  className="rounded-2xl py-3 font-bold"
                >
                  {t("contentDetails.tabs.reviews")}
                </Tabs.TabsTrigger>
              </Tabs.TabsList>

              <Tabs.TabsContent value="overview" className="space-y-6">
                <GlassCard className="p-6" glow={false}>
                  <div className="relative z-10">
                    <h2 className="text-2xl font-medium">
                      {t("contentDetails.course.whatYouWillLearn")}
                    </h2>
                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      {(course.learnings ?? []).map((item) => (
                        <div
                          key={item}
                          className="rounded-2xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6" glow={false}>
                  <div className="relative z-10">
                    <h2 className="text-2xl font-medium">
                      {t("contentDetails.course.requirements")}
                    </h2>
                    <ul className="mt-5 space-y-3">
                      {(course.requirements ?? []).map((item) => (
                        <li
                          key={item}
                          className="rounded-2xl border border-glass-border bg-background/45 px-4 py-3 text-sm text-muted-foreground"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </GlassCard>
              </Tabs.TabsContent>

              <Tabs.TabsContent value="curriculum">
                <CourseCurriculum sections={course.curriculumSections} />
              </Tabs.TabsContent>

              <Tabs.TabsContent value="reviews" className="space-y-6">
                <ReviewForm
                  onSubmit={actions.onSubmitReview}
                  isLoading={actions.isReviewLoading}
                  defaultRating={actions.myReview?.rating}
                  defaultComment={actions.myReview?.comment}
                />
                <ReviewsList
                  reviews={actions.reviews}
                  isLoading={actions.isReviewsLoading}
                />
              </Tabs.TabsContent>
            </Tabs.Tabs>
          </section>

          {isPaid && (
            <aside>
              <DetailActionPanel
                price={course.price}
                isFree={course.isFree}
                currency={course.currency}
                isInCart={actions.isInCart}
                onAddToCart={actions.onAddToCart}
                cartLoading={actions.isCartLoading}
              />
            </aside>
          )}
        </div>
      </div>
    </main>
  );
};

export default CourseDetailPage;
