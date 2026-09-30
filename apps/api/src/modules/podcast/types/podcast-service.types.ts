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
  imageUrl: string | null;
  category: string;
  rating: number;
  episodeCount: number;
  createdAt: Date;
  score: number;
};
