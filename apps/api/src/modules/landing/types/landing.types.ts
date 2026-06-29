export type TPopularCategoryRawRow = {
  category: string;
  totalItems: bigint;
  eventCount: bigint;
  courseCount: bigint;
  podcastCount: bigint;
  youtubeCount: bigint;
  averageRating: number | null;
  popularityScore: number | null;
};
