"use client";

import { Clock3, PlayCircle, UserRound } from "lucide-react";
import { Headphones, ListMusic } from "lucide-react";
import { useContentActions } from "@/hooks/useContentActions";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";

import * as PodcastApi from "@/lib/rtk/endpoints/podcast.api";
import * as Tabs from "@ui/tabs";
import * as API from "@/lib/graphql/generated";

import DetailHeroActions from "@modules/ContentDetail/parts/DetailHeroActions";
import PodcastEpisodes from "@modules/ContentDetail/parts/PodcastEpisodes";
import DetailSkeleton from "@modules/ContentDetail/parts/DetailSkeleton";
import DetailMetaPill from "@modules/ContentDetail/parts/DetailMetaPill";
import ReviewsList from "@modules/ContentDetail/parts/ReviewList";
import DetailHero from "@modules/ContentDetail/parts/DetailHero";
import ReviewForm from "@modules/ContentDetail/parts/ReviewForm";

const PodcastDetailPage = ({ slug }: { slug: string }) => {
  const { t } = useI18n();

  const { data: podcast, isLoading } = PodcastApi.usePodcastBySlugQuery({
    slug,
  });

  const { data: episodes = [] } = PodcastApi.usePodcastEpisodesQuery(
    {
      podcastId: podcast?.id ?? "",
    },
    {
      skip: !podcast?.id,
    },
  );

  const actions = useContentActions({
    contentType: API.ContentType.Podcast,
    contentId: podcast?.id,
  });

  const latestEpisode = episodes[0];

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

  const calendarPrefill = {
    title: podcast.title,
    type: API.CalendarEventType.Other,
    contentId: podcast.id,
    contentType: API.ContentType.Podcast,
  };

  const primary = latestEpisode?.audioUrl
    ? {
        label: t("contentDetails.podcast.playLatest"),
        href: latestEpisode.audioUrl,
        icon: <PlayCircle className="h-4 w-4" />,
      }
    : {
        label: t("contentDetails.podcast.followPodcast"),
        doneLabel: t("contentDetails.actions.enrolled"),
        done: actions.isEnrolled,
        loading: actions.isEnrollLoading,
        onClick: actions.onEnroll,
        icon: <PlayCircle className="h-4 w-4" />,
      };

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <DetailHero
          title={podcast.title}
          rating={podcast.rating}
          imageUrl={podcast.imageUrl}
          category={podcast.category}
          description={podcast.description}
          ratingCount={podcast.ratingCount}
          badge={t("contentDetails.podcast.badge")}
          actions={
            <DetailHeroActions
              contentType={API.ContentType.Podcast}
              prefill={calendarPrefill}
              wishlist={{
                isWishlisted: actions.isWishlisted,
                loading: actions.isWishlistLoading,
                onToggle: actions.onToggleWishlist,
              }}
              primary={primary}
            />
          }
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DetailMetaPill
              value={podcast.host}
              icon={<UserRound className="h-4 w-4" />}
              label={t("contentDetails.podcast.host")}
            />
            <DetailMetaPill
              value={podcast.listeners}
              icon={<Headphones className="h-4 w-4" />}
              label={t("contentDetails.podcast.listeners")}
            />
            <DetailMetaPill
              value={podcast.episodeCount}
              icon={<ListMusic className="h-4 w-4" />}
              label={t("contentDetails.podcast.episodes")}
            />
            <DetailMetaPill
              icon={<Clock3 className="h-4 w-4" />}
              label={t("contentDetails.podcast.duration")}
              value={
                podcast.durationMinutes
                  ? t("contentDetails.common.minutes", {
                      count: podcast.durationMinutes,
                    })
                  : null
              }
            />
          </div>
        </DetailHero>

        <section className="min-w-0">
          <Tabs.Tabs defaultValue="episodes" className="space-y-6">
            <Tabs.TabsList className="grid h-auto grid-cols-2 rounded-3xl border border-glass-border bg-background/60 p-2 backdrop-blur-xl">
              <Tabs.TabsTrigger
                value="episodes"
                className="rounded-2xl py-3 font-bold"
              >
                {t("contentDetails.tabs.episodes")}
              </Tabs.TabsTrigger>
              <Tabs.TabsTrigger
                value="reviews"
                className="rounded-2xl py-3 font-bold"
              >
                {t("contentDetails.tabs.reviews")}
              </Tabs.TabsTrigger>
            </Tabs.TabsList>

            <Tabs.TabsContent value="episodes">
              <PodcastEpisodes episodes={episodes} />
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
      </div>
    </main>
  );
};

export default PodcastDetailPage;
