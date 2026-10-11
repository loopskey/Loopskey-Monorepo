"use client";

import { Eye, PlayCircle, Radio, Users } from "lucide-react";
import { TYouTubeDetailPageProps } from "@/types/content-module.types";
import { ContentType, PduSource } from "@/lib/graphql/base";
import { resolveExternalUrl } from "@/utils/content-source.helper";
import { humanizeEnumValue } from "@/utils/function-helper";
import { CalendarEventType } from "@/lib/graphql/base";
import { useContentActions } from "@/hooks/useContentActions";
import { useI18n } from "@/hooks/useI18n";

import DetailSidebarActions from "@modules/ContentDetail/parts/DetailSidebarActions";
import DetailPageHeader from "@modules/ContentDetail/parts/DetailPageHeader";
import YouTubeVideos from "@modules/ContentDetail/parts/YoutubeVideos";
import DetailSidebar from "@modules/ContentDetail/parts/DetailSidebar";
import DetailSection from "@modules/ContentDetail/parts/DetailSection";
import DetailLayout from "@modules/ContentDetail/parts/DetailLayout";

const YouTubeDetailPage = ({ channel, videos }: TYouTubeDetailPageProps) => {
  const { t } = useI18n();

  const actions = useContentActions({
    skipEnrollment: true,
    contentId: channel.id,
    contentType: ContentType.Youtube,
  });

  return (
    <DetailLayout
      header={
        <DetailPageHeader
          title={channel.title}
          contentLanguage={channel.contentLanguage}
          availableLocales={channel.availableLocales}
          rating={channel.rating}
          ratingCount={channel.ratingCount}
          badge={t("contentDetails.youtube.badge")}
          category={t(
            `content.enums.youtubeCategory.${channel.category}`,
            {},
            humanizeEnumValue(channel.category),
          )}
          byline={
            channel.provider
              ? t("contentDetails.youtube.byProvider", {
                  name: channel.provider,
                })
              : null
          }
        />
      }
      sidebar={
        <DetailSidebar
          id={channel.id}
          kind="youtube"
          title={channel.title}
          imageUrl={channel.imageUrl}
          category={channel.category}
          actions={
            <DetailSidebarActions
              contentType={ContentType.Youtube}
              contentUrl={resolveExternalUrl(channel.channelUrl)}
              wishlist={{
                isWishlisted: actions.isWishlisted,
                loading: actions.isWishlistLoading,
                onToggle: actions.onToggleWishlist,
              }}
              prefill={{
                title: channel.title,
                type: CalendarEventType.Other,
                contentId: channel.id,
                contentType: ContentType.Youtube,
              }}
              completed={{
                title: channel.title,
                contentId: channel.id,
                contentType: ContentType.Youtube,
                activityType: PduSource.VideoLecture,
                providerOrganizer: channel.provider,
              }}
            />
          }
          facts={[
            {
              key: "provider",
              value: channel.provider,
              label: t("contentDetails.youtube.provider"),
              icon: <Radio className="h-4 w-4" />,
            },
            {
              key: "subscribers",
              value: channel.subscribers || null,
              label: t("contentDetails.youtube.subscribers"),
              icon: <Users className="h-4 w-4" />,
            },
            {
              key: "videos",
              value: channel.videoCount || null,
              label: t("contentDetails.youtube.videos"),
              icon: <PlayCircle className="h-4 w-4" />,
            },
            {
              key: "views",
              value: channel.views || null,
              label: t("contentDetails.youtube.views"),
              icon: <Eye className="h-4 w-4" />,
            },
          ]}
        />
      }
    >
      {channel.description && (
        <DetailSection title={t("contentDetails.youtube.about")}>
          <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-base">
            {channel.description}
          </p>
        </DetailSection>
      )}

      {videos.length > 0 && (
        <DetailSection title={t("contentDetails.youtube.videos")}>
          <YouTubeVideos videos={videos} />
        </DetailSection>
      )}
    </DetailLayout>
  );
};

export default YouTubeDetailPage;
