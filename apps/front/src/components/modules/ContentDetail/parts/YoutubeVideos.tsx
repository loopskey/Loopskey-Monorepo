"use client";

import { ExternalLink, PlayCircle } from "lucide-react";
import { TYouTubeVideosProps } from "@/types/content-module.types";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

import Image from "next/image";

const YouTubeVideos = ({ videos }: TYouTubeVideosProps) => {
  const { t } = useI18n();

  if (!videos?.length) {
    return (
      <GlassCard className="p-8 text-center" glow={false}>
        <div className="relative z-10">
          <PlayCircle className="mx-auto mb-3 h-8 w-8 text-primary" />
          <h3 className="font-medium">{t("contentDetails.videos.empty")}</h3>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {videos.map((video) => (
        <GlassCard key={video.id} className="overflow-hidden p-0" glow={false}>
          <div className="relative z-10">
            <div className="relative h-44 bg-muted">
              {video.thumbnailUrl ? (
                <Image
                  fill
                  alt={video.title}
                  className="object-cover"
                  src={video.thumbnailUrl}
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-primary/10">
                  <PlayCircle className="h-12 w-12 text-primary" />
                </div>
              )}
            </div>

            <div className="p-5">
              <h3 className="line-clamp-2 text-lg font-medium">
                {video.title}
              </h3>

              {video.description && (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {video.description}
                </p>
              )}

              <Button
                radius="xl"
                type="button"
                className="mt-4"
                variant="brandSoft"
                disabled={!video.videoUrl}
                asChild={Boolean(video.videoUrl)}
              >
                {video.videoUrl ? (
                  <a href={video.videoUrl} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                    {t("contentDetails.videos.watch")}
                  </a>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4" />
                    {t("contentDetails.videos.unavailable")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

export default YouTubeVideos;
