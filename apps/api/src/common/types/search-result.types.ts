export type TSearchPageInfo = {
  hasNextPage: boolean;
  nextCursor: string | null;
};

export type TRawSearchRow<T> = T & {
  searchRank: number | null;
  totalCount: bigint | number;
};
