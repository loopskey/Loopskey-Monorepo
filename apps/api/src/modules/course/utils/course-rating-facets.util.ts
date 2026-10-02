export type CourseRatingBucket = { bucket: number; count: number };

export type CourseRatingFacet = { minimum: number; count: number };

export const COURSE_RATING_MIN = 1;

export const COURSE_RATING_MAX = 5;

export const toCourseRatingFacets = (
  buckets: readonly CourseRatingBucket[],
): CourseRatingFacet[] => {
  const valid = buckets
    .filter(
      (row) =>
        Number.isFinite(row.bucket) &&
        row.bucket >= COURSE_RATING_MIN &&
        row.bucket <= COURSE_RATING_MAX &&
        row.count > 0,
    )
    .sort((left, right) => right.bucket - left.bucket);

  let cumulative = 0;
  return valid.map((row) => {
    cumulative += row.count;
    return { minimum: row.bucket, count: cumulative };
  });
};
