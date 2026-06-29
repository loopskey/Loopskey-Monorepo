"use client";

import { Headphones, PlayCircle } from "lucide-react";
import { TPodcastEpisodesProps } from "@/types/content-module.types";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

const PodcastEpisodes = ({ episodes }: TPodcastEpisodesProps) => {
  const { t } = useI18n();

  if (!episodes?.length) {
    return (
      <GlassCard className="p-8 text-center" glow={false}>
        <div className="relative z-10">
          <Headphones className="mx-auto mb-3 h-8 w-8 text-primary" />
          <h3 className="font-medium">{t("contentDetails.episodes.empty")}</h3>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {episodes.map((episode) => (
        <GlassCard key={episode.id} className="p-5" glow={false}>
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold text-primary">
                {t("contentDetails.episodes.episode")} {episode.episodeNumber}
              </p>
              <h3 className="mt-1 text-lg font-medium">{episode.title}</h3>
              {episode.description && (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {episode.description}
                </p>
              )}
            </div>

            <Button
              radius="xl"
              type="button"
              variant="brandSoft"
              disabled={!episode.audioUrl}
              asChild={Boolean(episode.audioUrl)}
            >
              {episode.audioUrl ? (
                <a href={episode.audioUrl} target="_blank">
                  <PlayCircle className="h-4 w-4" />
                  {t("contentDetails.episodes.play")}
                </a>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4" />
                  {t("contentDetails.episodes.unavailable")}
                </>
              )}
            </Button>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

export default PodcastEpisodes;
