import { Role } from "@prisma/client";

export type TCurrentUserPayload = {
  id?: string;
  sub?: string;
  role: Role;
};

export type PodcastRequester = {
  id: string;
  role: Role;
};

export type TPodcastCandidateRow = {
  id: string;
  title: string;
  rating: number;
  category: string;
  listeners: number;
  matchScore: number;
  description: string;
  ratingCount: number;
  isFeatured: boolean;
  durationMinutes: number | null;
};

export type PodcastCatalogSearchRow = {
  id: string;
  slug: string;
  title: string;
  score: number;
  rating: number;
  createdAt: Date;
  category: string;
  episodeCount: number;
  imageUrl: string | null;
};

export type LocalizablePodcast = {
  id: string;
  title: string;
  sourceLanguage?: string | null;
};
