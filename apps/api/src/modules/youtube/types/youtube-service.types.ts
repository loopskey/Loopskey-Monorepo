import { Role } from "@prisma/client";

export type TCurrentUserPayload = {
  role: Role;
  id?: string;
  sub?: string;
};

export type TChannelCandidateRow = {
  id: string;
  title: string;
  rating: number;
  category: string;
  matchScore: number;
  ratingCount: number;
  subscribers: number;
  isFeatured: boolean;
  description: string | null;
};

export type ChannelCatalogSearchRow = {
  id: string;
  slug: string;
  title: string;
  score: number;
  rating: number;
  createdAt: Date;
  category: string;
  videoCount: number;
  imageUrl: string | null;
};

export type LocalizableChannel = {
  id: string;
  title: string;
  sourceLanguage?: string | null;
};
