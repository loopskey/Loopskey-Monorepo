import { toCourseRatingFacets } from "./course-rating-facets.util";

describe("toCourseRatingFacets", () => {
  it("orders thresholds descending and accumulates counts, so each equals >= minimum", () => {
    expect(
      toCourseRatingFacets([
        { bucket: 4, count: 3 },
        { bucket: 5, count: 1 },
        { bucket: 4.5, count: 2 },
      ]),
    ).toEqual([
      { minimum: 5, count: 1 },
      { minimum: 4.5, count: 3 },
      { minimum: 4, count: 6 },
    ]);
  });

  it("emits only the half-star buckets that hold a course", () => {
    expect(
      toCourseRatingFacets([
        { bucket: 4.5, count: 2 },
        { bucket: 4, count: 1 },
      ]).map((facet) => facet.minimum),
    ).toEqual([4.5, 4]);
  });

  it("drops a bucket nothing falls into", () => {
    expect(toCourseRatingFacets([{ bucket: 3.5, count: 0 }])).toEqual([]);
  });

  it("never produces a zero-star option from unreviewed courses", () => {
    expect(
      toCourseRatingFacets([
        { bucket: 0, count: 120 },
        { bucket: 4, count: 2 },
      ]),
    ).toEqual([{ minimum: 4, count: 2 }]);
  });

  it.each([
    ["below the review range", 0.5],
    ["above the review range", 5.5],
    ["not a number", Number.NaN],
    ["infinite", Number.POSITIVE_INFINITY],
  ])("ignores a rating %s", (_case, bucket) => {
    expect(toCourseRatingFacets([{ bucket, count: 4 }])).toEqual([]);
  });

  it("returns nothing for an empty catalogue", () => {
    expect(toCourseRatingFacets([])).toEqual([]);
  });
});
