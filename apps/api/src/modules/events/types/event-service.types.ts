import { Role } from "@prisma/client";

export type TCurrentUserPayload = {
  role: Role;
  id?: string;
  sub?: string;
};

export type EventCatalogSearchRow = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  category: string;
  rating: number;
  startDate: Date;
  createdAt: Date;
  score: number;
};
