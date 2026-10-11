import { httpUrl, isoDuration } from "@/lib/structured-data/facts";
import { plainList, plainText } from "@/lib/structured-data/facts";
import { EventDeliveryMode } from "@/lib/graphql/base";
import { zonedIsoDateTime } from "@/lib/structured-data/facts";
import { languageCode } from "@/lib/structured-data/facts";
import { nodeId } from "@/lib/structured-data/graph";

import type { PublicCourse, PublicEvent } from "@/lib/server/public-content";
import type { PublicPodcastEpisode } from "@/lib/server/public-content";
import type { PublicYouTubeChannel } from "@/lib/server/public-content";
import type { PublicPodcast } from "@/lib/server/public-content";
import type { JsonLdNode } from "@/lib/structured-data/json-ld";

const DEFAULT_CURRENCY = "USD";

const ATTENDANCE_MODE: Partial<Record<EventDeliveryMode, string>> = {
  [EventDeliveryMode.InPerson]: "https://schema.org/OfflineEventAttendanceMode",
  [EventDeliveryMode.LiveOnline]:
    "https://schema.org/OnlineEventAttendanceMode",
  [EventDeliveryMode.Hybrid]: "https://schema.org/MixedEventAttendanceMode",
};

const PHYSICAL_MODES: readonly EventDeliveryMode[] = [
  EventDeliveryMode.InPerson,
  EventDeliveryMode.Hybrid,
];

type PriceFacts = {
  price?: number | string | null;
  currency?: string | null;
  isFree?: boolean | null;
};

const offerNode = (
  { price, currency, isFree }: PriceFacts,
  url: string,
): JsonLdNode | undefined => {
  const amount = Number(price ?? 0);
  const isPaid = Number.isFinite(amount) && amount > 0;
  if (!isFree && !isPaid) return undefined;
  return {
    "@type": "Offer",
    url,
    price: isFree ? "0" : amount.toFixed(2),
    priceCurrency: currency || DEFAULT_CURRENCY,
  };
};

export const courseNode = (course: PublicCourse, url: string): JsonLdNode => ({
  "@type": "Course",
  "@id": nodeId(url, "course"),
  url,
  name: plainText(course.title),
  description: plainText(course.description),
  inLanguage: languageCode(course.contentLanguage),
  image: httpUrl(course.imageUrl),
  educationalLevel: plainText(course.level),
  timeRequired: isoDuration(course.durationMinutes),
  teaches: plainList(course.learnings),
  coursePrerequisites: plainList(course.requirements),
  offers: offerNode(course, url),
});

export const eventNode = (
  event: PublicEvent,
  url: string,
): JsonLdNode | null => {
  const startDate = zonedIsoDateTime(event.startDate, event.timezone);
  const name = plainText(event.title);
  if (!startDate || !name) return null;
  const hasPlace = PHYSICAL_MODES.includes(event.deliveryMode);
  const place = plainText(event.location);
  const organizer = plainText(event.organizer);
  return {
    "@type": "Event",
    "@id": nodeId(url, "event"),
    url,
    name,
    description: plainText(event.description),
    startDate,
    endDate: zonedIsoDateTime(event.endDate, event.timezone),
    eventAttendanceMode: ATTENDANCE_MODE[event.deliveryMode],
    location: hasPlace && place ? { "@type": "Place", name: place } : undefined,
    organizer: organizer
      ? { "@type": "Organization", name: organizer }
      : undefined,
    image: httpUrl(event.imageUrl),
    offers: offerNode(event, url),
  };
};

export const podcastNodes = (
  podcast: PublicPodcast,
  episodes: readonly PublicPodcastEpisode[],
  url: string,
): JsonLdNode[] => {
  const seriesId = nodeId(url, "podcast");
  const episodeNodes = episodes.map((episode) => ({
    "@type": "PodcastEpisode",
    "@id": nodeId(url, `episode-${episode.id}`),
    name: plainText(episode.title),
    description: plainText(episode.description),
    episodeNumber: episode.episodeNumber,
    duration: isoDuration(episode.durationMinutes),
    partOfSeries: { "@id": seriesId },
    associatedMedia: httpUrl(episode.audioUrl)
      ? { "@type": "AudioObject", contentUrl: httpUrl(episode.audioUrl) }
      : undefined,
  }));
  const series: JsonLdNode = {
    "@type": "PodcastSeries",
    "@id": seriesId,
    url,
    name: plainText(podcast.title),
    description: plainText(podcast.description),
    inLanguage: languageCode(podcast.contentLanguage),
    image: httpUrl(podcast.imageUrl),
    hasPart: episodeNodes.map((episode) => ({ "@id": episode["@id"] })),
  };
  return [series, ...episodeNodes];
};

export const channelNode = (
  channel: PublicYouTubeChannel,
  url: string,
): JsonLdNode => ({
  "@type": "CreativeWorkSeries",
  "@id": nodeId(url, "channel"),
  url,
  name: plainText(channel.title),
  description: plainText(channel.description),
  inLanguage: languageCode(channel.contentLanguage),
  image: httpUrl(channel.imageUrl),
});
