export type TCourseCandidateRow = {
  id: string;
  title: string;
  level: string;
  rating: number;
  isFree: boolean;
  category: string;
  matchScore: number;
  description: string;
  ratingCount: number;
  isFeatured: boolean;
  professionals: number;
  durationMinutes: number | null;
};

export type CourseCatalogSearchRow = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  category: string;
  rating: number;
  durationMinutes: number | null;
  createdAt: Date;
  score: number;
};
