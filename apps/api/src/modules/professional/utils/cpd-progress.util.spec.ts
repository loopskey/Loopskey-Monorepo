import { computeEarned, computeProgressPercent } from "./cpd-progress.util";

describe("computeProgressPercent", () => {
  it("returns 0 for a zero total instead of NaN or Infinity", () => {
    expect(computeProgressPercent(0, 0)).toBe(0);
    expect(computeProgressPercent(10, 0)).toBe(0);
  });

  it("computes the earned/total ratio as a percentage", () => {
    expect(computeProgressPercent(5, 20)).toBe(25);
  });

  it("clamps an over-complete ratio to 100", () => {
    expect(computeProgressPercent(30, 20)).toBe(100);
  });

  it("never returns a negative percentage", () => {
    expect(computeProgressPercent(-5, 20)).toBe(0);
  });

  it("rounds fractional credits to two decimals", () => {
    expect(computeProgressPercent(1, 3)).toBe(33.33);
  });
});

describe("computeEarned", () => {
  it("still sums starting and activity credits for its existing callers", () => {
    expect(computeEarned(10, 5)).toBe(15);
  });
});
