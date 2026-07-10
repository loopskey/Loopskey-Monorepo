"use client";

import { CalendarDays, MapPin, MonitorPlay, UserPlus, Users } from "lucide-react";
import { useContentActions } from "@/hooks/useContentActions";
import { formatDate } from "@/utils/function-helper";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";

import DetailHeroActions from "@modules/ContentDetail/parts/DetailHeroActions";
import DetailActionPanel from "@modules/ContentDetail/parts/DetailActionPanel";
import DetailSkeleton from "@modules/ContentDetail/parts/DetailSkeleton";
import DetailMetaPill from "@modules/ContentDetail/parts/DetailMetaPill";
import EventSchedule from "@modules/ContentDetail/parts/EventSchedule";
import ReviewForm from "@modules/ContentDetail/parts/ReviewForm";
import ReviewsList from "@modules/ContentDetail/parts/ReviewList";
import DetailHero from "@modules/ContentDetail/parts/DetailHero";

import * as EventApi from "@/lib/rtk/endpoints/event.api";
import * as Tabs from "@ui/tabs";
import * as API from "@/lib/graphql/generated";

const EventDetailPage = ({ slug }: { slug: string }) => {
  const { t } = useI18n();

  const { data: event, isLoading } = EventApi.useEventBySlugQuery({ slug });

  const actions = useContentActions({
    contentType: API.ContentType.Event,
    contentId: event?.id,
  });

  if (isLoading) return <DetailSkeleton />;

  if (!event) {
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
    title: event.title,
    type:
      event.type === API.EventType.Webinar
        ? API.CalendarEventType.Webinar
        : event.type === API.EventType.Training
          ? API.CalendarEventType.Training
          : API.CalendarEventType.Event,
    startDate: event.startDate,
    endDate: event.endDate,
    contentId: event.id,
    contentType: API.ContentType.Event,
  };

  const isPaid = !event.isFree && Number(event.price ?? 0) > 0;

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <DetailHero
          title={event.title}
          imageUrl={event.imageUrl}
          category={event.category}
          ratingCount={event.ratingCount}
          description={event.description}
          badge={t("contentDetails.event.badge")}
          rating={event.averageRating ?? event.rating}
          actions={
            <DetailHeroActions
              contentType={API.ContentType.Event}
              prefill={calendarPrefill}
              completed={{
                title: event.title,
                contentId: event.id,
                contentType: API.ContentType.Event,
                activityType: API.PduSource.Event,
              }}
              wishlist={{
                isWishlisted: actions.isWishlisted,
                loading: actions.isWishlistLoading,
                onToggle: actions.onToggleWishlist,
              }}
              primary={{
                label: t("contentDetails.event.registerNow"),
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
              value={formatDate(event.startDate)}
              label={t("contentDetails.event.date")}
              icon={<CalendarDays className="h-4 w-4" />}
            />
            <DetailMetaPill
              value={event.deliveryMode}
              icon={<MonitorPlay className="h-4 w-4" />}
              label={t("contentDetails.event.delivery")}
            />
            <DetailMetaPill
              icon={<MapPin className="h-4 w-4" />}
              label={t("contentDetails.event.location")}
              value={event.location ?? event.onlineUrl}
            />
            <DetailMetaPill
              value={event.attendees}
              icon={<Users className="h-4 w-4" />}
              label={t("contentDetails.event.attendees")}
            />
          </div>
        </DetailHero>

        <div
          className={`grid gap-6 ${
            isPaid ? "lg:grid-cols-[minmax(0,1fr)_360px]" : ""
          }`}
        >
          <section className="min-w-0">
            <Tabs.Tabs defaultValue="schedule" className="space-y-6">
              <Tabs.TabsList className="grid h-auto grid-cols-2 rounded-3xl border border-glass-border bg-background/60 p-2 backdrop-blur-xl">
                <Tabs.TabsTrigger
                  value="schedule"
                  className="rounded-2xl py-3 font-bold"
                >
                  {t("contentDetails.tabs.schedule")}
                </Tabs.TabsTrigger>
                <Tabs.TabsTrigger
                  value="reviews"
                  className="rounded-2xl py-3 font-bold"
                >
                  {t("contentDetails.tabs.reviews")}
                </Tabs.TabsTrigger>
              </Tabs.TabsList>

              <Tabs.TabsContent value="schedule">
                <EventSchedule items={event.scheduleItems} />
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
                price={event.price}
                isFree={event.isFree}
                currency={event.currency}
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

export default EventDetailPage;
