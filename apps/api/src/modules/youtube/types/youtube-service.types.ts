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
