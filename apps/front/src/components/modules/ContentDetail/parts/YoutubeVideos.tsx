"use client";

import { ExternalLink, PlayCircle } from "lucide-react";
import { TYouTubeVideosProps } from "@/types/content-module.types";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

import Image from "next/image";

const YouTubeVideos = ({ videos }: TYouTubeVideosProps) => {
  const { t } = useI18n();

  if (!videos?.length) return null;

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {videos.map((video) => (
        <div key={video.id} className="overflow-hidden rounded-lg border">
          <div className="relative h-40 bg-muted">
            {video.thumbnailUrl ? (
              <Image
                fill
                alt={video.title}
                className="object-cover"
                src={video.thumbnailUrl}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-primary/10">
                <PlayCircle className="h-10 w-10 text-primary" />
              </div>
            )}
          </div>

          <div className="p-4">
            <h4 className="line-clamp-2 font-medium">{video.title}</h4>

            {video.description && (
              <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                {video.description}
              </p>
            )}

            <Button
              radius="xl"
              type="button"
              variant="outline"
              className="mt-3 w-full"
              disabled={!video.videoUrl}
              asChild={Boolean(video.videoUrl)}
            >
              {video.videoUrl ? (
                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
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
      ))}
    </div>
  );
};

export default YouTubeVideos;
