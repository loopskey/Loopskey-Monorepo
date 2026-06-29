"use client";

import { Eye, PlayCircle, Radio, Users } from "lucide-react";
import { useContentActions } from "@/hooks/useContentActions";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";

import * as YouTubeApi from "@/lib/rtk/endpoints/youtube.api";
import * as Tabs from "@ui/tabs";
import * as API from "@/lib/graphql/generated";

import DetailActionPanel from "@modules/ContentDetail/parts/DetailActionPanel";
import DetailSkeleton from "@modules/ContentDetail/parts/DetailSkeleton";
import DetailMetaPill from "@modules/ContentDetail/parts/DetailMetaPill";
import YouTubeVideos from "@modules/ContentDetail/parts/YoutubeVideos";
import ReviewsList from "@modules/ContentDetail/parts/ReviewList";
import DetailHero from "@modules/ContentDetail/parts/DetailHero";
import ReviewForm from "@modules/ContentDetail/parts/ReviewForm";

const YouTubeDetailPage = ({ slug }: { slug: string }) => {
  const { t } = useI18n();

  const { data: channel, isLoading } = YouTubeApi.useYoutubeChannelBySlugQuery({
    slug,
  });

  const { data: videos = [] } = YouTubeApi.useYoutubeVideosQuery(
    {
      channelId: channel?.id ?? "",
    },
    {
      skip: !channel?.id,
    },
  );

  const actions = useContentActions({
    contentType: API.ContentType.Youtube,
    contentId: channel?.id,
  });

  if (isLoading) return <DetailSkeleton />;

  if (!channel) {
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
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <DetailHero
          title={channel.title}
          rating={channel.rating}
          category={channel.category}
          imageUrl={channel.imageUrl}
          description={channel.description}
          ratingCount={channel.ratingCount}
          badge={t("contentDetails.youtube.badge")}
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DetailMetaPill
              value={channel.provider}
              icon={<Radio className="h-4 w-4" />}
              label={t("contentDetails.youtube.provider")}
            />
            <DetailMetaPill
              value={channel.subscribers}
              icon={<Users className="h-4 w-4" />}
              label={t("contentDetails.youtube.subscribers")}
            />
            <DetailMetaPill
              value={channel.videoCount}
              icon={<PlayCircle className="h-4 w-4" />}
              label={t("contentDetails.youtube.videos")}
            />
            <DetailMetaPill
              value={channel.views}
              icon={<Eye className="h-4 w-4" />}
              label={t("contentDetails.youtube.views")}
            />
          </div>
        </DetailHero>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0">
            <Tabs.Tabs defaultValue="videos" className="space-y-6">
              <Tabs.TabsList className="grid h-auto grid-cols-2 rounded-3xl border border-glass-border bg-background/60 p-2 backdrop-blur-xl">
                <Tabs.TabsTrigger
                  value="videos"
                  className="rounded-2xl py-3 font-bold"
                >
                  {t("contentDetails.tabs.videos")}
                </Tabs.TabsTrigger>
                <Tabs.TabsTrigger
                  value="reviews"
                  className="rounded-2xl py-3 font-bold"
                >
                  {t("contentDetails.tabs.reviews")}
                </Tabs.TabsTrigger>
              </Tabs.TabsList>

              <Tabs.TabsContent value="videos">
                <YouTubeVideos videos={videos} />
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

          <aside>
            <DetailActionPanel
              isFree
              hideCart
              price={0}
              currency="USD"
              isInCart={actions.isInCart}
              onEnroll={actions.onEnroll}
              isEnrolled={actions.isEnrolled}
              isWishlisted={actions.isWishlisted}
              onWishlist={actions.onToggleWishlist}
              enrollLoading={actions.isEnrollLoading}
              wishlistLoading={actions.isWishlistLoading}
              enrollLabel={t("contentDetails.youtube.followChannel")}
            />
          </aside>
        </div>
      </div>
    </main>
  );
};

export default YouTubeDetailPage;
