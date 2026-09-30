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
  imageUrl: string | null;
  category: string;
  rating: number;
  videoCount: number;
  createdAt: Date;
  score: number;
};
