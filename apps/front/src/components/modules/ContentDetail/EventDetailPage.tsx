"use client";

import { Award, MapPin, MonitorPlay, Users } from "lucide-react";
import { ContentType, EventType, PduSource } from "@/lib/graphql/base";
import { formatEventDateTime } from "@/utils/content-source.helper";
import { resolveExternalUrl } from "@/utils/content-source.helper";
import { CalendarEventType } from "@/lib/graphql/base";
import { humanizeEnumValue } from "@/utils/function-helper";
import { useContentActions } from "@/hooks/useContentActions";
import { formatPriceLabel } from "@/utils/content-source.helper";
import { GlassCard } from "@elements/glass-card";
import { UserPlus } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Mic2 } from "lucide-react";

import DetailSidebarActions from "@modules/ContentDetail/parts/DetailSidebarActions";
import DetailPageHeader from "@modules/ContentDetail/parts/DetailPageHeader";
import DetailSkeleton from "@modules/ContentDetail/parts/DetailSkeleton";
import EventSchedule from "@modules/ContentDetail/parts/EventSchedule";
import DetailSidebar from "@modules/ContentDetail/parts/DetailSidebar";
import DetailSummary from "@modules/ContentDetail/parts/DetailSummary";
import DetailSection from "@modules/ContentDetail/parts/DetailSection";
import DetailLayout from "@modules/ContentDetail/parts/DetailLayout";

import * as EventApi from "@/lib/rtk/endpoints/event.api";

const EventDetailPage = ({ slug }: { slug: string }) => {
  const { t } = useI18n();

  const { data: event, isLoading } = EventApi.useEventBySlugQuery({ slug });

  const actions = useContentActions({
    skipReviews: true,
    contentId: event?.id,
    contentType: ContentType.Event,
    skipEnrollment: !event?.registrationEnabled,
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

  const endsAt = formatEventDateTime(event.endDate, event.timezone);

  const register = event.registrationEnabled
    ? {
        icon: <UserPlus className="h-4 w-4" />,
        label: t("contentDetails.event.registerNow"),
        doneLabel: t("contentDetails.actions.enrolled"),
        loading: actions.isEnrollLoading,
        onClick: actions.onEnroll,
        done: actions.isEnrolled,
      }
    : null;

  return (
    <DetailLayout
      header={
        <DetailPageHeader
          title={event.title}
          badge={t("contentDetails.event.badge")}
          rating={event.averageRating ?? event.rating}
          ratingCount={event.ratingCount}
          byline={
            event.organizer
              ? t("contentDetails.event.byOrganizer", {
                  name: event.organizer,
                })
              : null
          }
          chips={[
            t(
              `content.enums.eventType.${event.type}`,
              {},
              humanizeEnumValue(event.type),
            ),
            t(
              `content.enums.eventCategory.${event.category}`,
              {},
              humanizeEnumValue(event.category),
            ),
          ]}
        />
      }
      sidebar={
        <DetailSidebar
          id={event.id}
          kind="event"
          title={event.title}
          imageUrl={event.imageUrl}
          category={event.category}
          summary={
            <DetailSummary
              items={[
                {
                  key: "starts",
                  label: t("contentDetails.event.date"),
                  value:
                    formatEventDateTime(event.startDate, event.timezone) ?? "",
                  hint: endsAt
                    ? t("contentDetails.event.endsAt", { date: endsAt })
                    : null,
                },
                {
                  key: "price",
                  label: t("contentDetails.common.price"),
                  value: formatPriceLabel(
                    t("contentDetails.common.free"),
                    event.price,
                    event.currency,
                    event.isFree,
                  ),
                },
              ]}
            />
          }
          actions={
            <DetailSidebarActions
              register={register}
              contentType={ContentType.Event}
              contentUrl={resolveExternalUrl(event.sourceUrl)}
              wishlist={{
                isWishlisted: actions.isWishlisted,
                loading: actions.isWishlistLoading,
                onToggle: actions.onToggleWishlist,
              }}
              prefill={{
                title: event.title,
                type:
                  event.type === EventType.Webinar
                    ? CalendarEventType.Webinar
                    : event.type === EventType.Training
                      ? CalendarEventType.Training
                      : CalendarEventType.Event,
                startDate: event.startDate,
                endDate: event.endDate,
                contentId: event.id,
                contentType: ContentType.Event,
              }}
              completed={{
                title: event.title,
                contentId: event.id,
                contentType: ContentType.Event,
                activityType: PduSource.Event,
              }}
            />
          }
          facts={[
            {
              key: "delivery",
              label: t("contentDetails.event.delivery"),
              icon: <MonitorPlay className="h-4 w-4" />,
              value: t(
                `providerDashboard.createEvent.enums.deliveryMode.${event.deliveryMode}`,
                {},
                humanizeEnumValue(event.deliveryMode),
              ),
            },
            {
              key: "location",
              value: event.location,
              label: t("contentDetails.event.location"),
              icon: <MapPin className="h-4 w-4" />,
            },
            {
              key: "speaker",
              value: event.speaker,
              label: t("contentDetails.event.speaker"),
              icon: <Mic2 className="h-4 w-4" />,
            },
            {
              key: "pdu",
              label: t("contentDetails.event.pdu"),
              icon: <Award className="h-4 w-4" />,
              value:
                event.pdu > 0
                  ? t("contentDetails.event.pduValue", { count: event.pdu })
                  : null,
            },
            {
              key: "attendees",
              value: event.attendees || null,
              label: t("contentDetails.event.attendees"),
              icon: <Users className="h-4 w-4" />,
            },
          ]}
        />
      }
    >
      {event.description && (
        <DetailSection title={t("contentDetails.event.about")}>
          <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-base">
            {event.description}
          </p>
        </DetailSection>
      )}

      {event.scheduleItems && event.scheduleItems.length > 0 && (
        <DetailSection title={t("contentDetails.tabs.schedule")}>
          <EventSchedule
            timeZone={event.timezone}
            items={event.scheduleItems}
          />
        </DetailSection>
      )}
    </DetailLayout>
  );
};

export default EventDetailPage;
