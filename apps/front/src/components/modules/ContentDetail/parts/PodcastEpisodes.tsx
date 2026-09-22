"use client";

import { TPodcastEpisodesProps } from "@/types/content-module.types";
import { formatDurationMinutes } from "@/utils/content-source.helper";
import { Clock3, PlayCircle } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

const PodcastEpisodes = ({ episodes }: TPodcastEpisodesProps) => {
  const { t } = useI18n();

  if (!episodes?.length) return null;

  return (
    <ol className="divide-y rounded-md border">
      {episodes.map((episode) => (
        <li
          key={episode.id}
          className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold text-primary">
              {t("contentDetails.episodes.episode")} {episode.episodeNumber}
            </p>
            <h4 className="mt-0.5 font-medium">{episode.title}</h4>

            {episode.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {episode.description}
              </p>
            )}

            {episode.durationMinutes ? (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" aria-hidden />
                {formatDurationMinutes(episode.durationMinutes)}
              </p>
            ) : null}
          </div>

          <Button
            radius="xl"
            type="button"
            variant="outline"
            className="shrink-0"
            disabled={!episode.audioUrl}
            asChild={Boolean(episode.audioUrl)}
          >
            {episode.audioUrl ? (
              <a
                href={episode.audioUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
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
        </li>
      ))}
    </ol>
  );
};

export default PodcastEpisodes;
