"use client";

import { Clock3, Headphones, ListMusic, UserRound } from "lucide-react";
import { ContentType, PduSource } from "@/lib/graphql/base";
import { formatDurationMinutes } from "@/utils/content-source.helper";
import { resolveExternalUrl } from "@/utils/content-source.helper";
import { CalendarEventType } from "@/lib/graphql/base";
import { humanizeEnumValue } from "@/utils/function-helper";
import { useContentActions } from "@/hooks/useContentActions";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";

import * as PodcastApi from "@/lib/rtk/endpoints/podcast.api";

import DetailSidebarActions from "@modules/ContentDetail/parts/DetailSidebarActions";
import DetailPageHeader from "@modules/ContentDetail/parts/DetailPageHeader";
import PodcastEpisodes from "@modules/ContentDetail/parts/PodcastEpisodes";
import DetailSkeleton from "@modules/ContentDetail/parts/DetailSkeleton";
import DetailSidebar from "@modules/ContentDetail/parts/DetailSidebar";
import DetailSection from "@modules/ContentDetail/parts/DetailSection";
import DetailLayout from "@modules/ContentDetail/parts/DetailLayout";

const PodcastDetailPage = ({ slug }: { slug: string }) => {
  const { t } = useI18n();

  const { data: podcast, isLoading } = PodcastApi.usePodcastBySlugQuery({
    slug,
  });

  const { data: episodes = [] } = PodcastApi.usePodcastEpisodesQuery(
    { podcastId: podcast?.id ?? "" },
    { skip: !podcast?.id },
  );

  const actions = useContentActions({
    skipEnrollment: true,
    contentId: podcast?.id,
    contentType: ContentType.Podcast,
  });

  if (isLoading) return <DetailSkeleton />;

  if (!podcast) {
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

  return (
    <DetailLayout
      header={
        <DetailPageHeader
          title={podcast.title}
          rating={podcast.rating}
          ratingCount={podcast.ratingCount}
          badge={t("contentDetails.podcast.badge")}
          category={t(
            `content.enums.podcastCategory.${podcast.category}`,
            {},
            humanizeEnumValue(podcast.category),
          )}
          byline={
            podcast.host
              ? t("contentDetails.podcast.byHost", { name: podcast.host })
              : null
          }
        />
      }
      sidebar={
        <DetailSidebar
          id={podcast.id}
          kind="podcast"
          title={podcast.title}
          imageUrl={podcast.imageUrl}
          category={podcast.category}
          actions={
            <DetailSidebarActions
              contentType={ContentType.Podcast}
              contentUrl={resolveExternalUrl(podcast.sourceUrl)}
              wishlist={{
                isWishlisted: actions.isWishlisted,
                loading: actions.isWishlistLoading,
                onToggle: actions.onToggleWishlist,
              }}
              prefill={{
                title: podcast.title,
                type: CalendarEventType.Other,
                contentId: podcast.id,
                contentType: ContentType.Podcast,
              }}
              completed={{
                title: podcast.title,
                contentId: podcast.id,
                contentType: ContentType.Podcast,
                activityType: PduSource.Podcast,
                providerOrganizer: podcast.host,
                durationMinutes: podcast.durationMinutes,
              }}
            />
          }
          facts={[
            {
              key: "host",
              value: podcast.host,
              label: t("contentDetails.podcast.host"),
              icon: <UserRound className="h-4 w-4" />,
            },
            {
              key: "listeners",
              value: podcast.listeners || null,
              label: t("contentDetails.podcast.listeners"),
              icon: <Headphones className="h-4 w-4" />,
            },
            {
              key: "episodes",
              value: podcast.episodeCount || null,
              label: t("contentDetails.podcast.episodes"),
              icon: <ListMusic className="h-4 w-4" />,
            },
            {
              key: "duration",
              label: t("contentDetails.podcast.duration"),
              value: formatDurationMinutes(podcast.durationMinutes),
              icon: <Clock3 className="h-4 w-4" />,
            },
          ]}
        />
      }
    >
      {podcast.description && (
        <DetailSection title={t("contentDetails.podcast.about")}>
          <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-base">
            {podcast.description}
          </p>
        </DetailSection>
      )}

      {episodes.length > 0 && (
        <DetailSection title={t("contentDetails.podcast.episodes")}>
          <PodcastEpisodes episodes={episodes} />
        </DetailSection>
      )}
    </DetailLayout>
  );
};

export default PodcastDetailPage;
