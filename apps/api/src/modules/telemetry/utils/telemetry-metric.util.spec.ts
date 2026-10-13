import { SearchHealthVitalStatus } from "@telemetry/enums/telemetry-register.enum";
import { TelemetryRating } from "@telemetry/enums/telemetry-register.enum";
import { TELEMETRY_METRIC_BUCKETS } from "@loopskey/api-contracts/validation";
import { TELEMETRY_LIMITS } from "@loopskey/api-contracts/validation";
import type { TelemetryMetric } from "@prisma/client";
import { daysBefore, utcDay } from "@telemetry/utils/telemetry-day.util";

import {
  bucketIndexOf,
  isWithinMetricRange,
  p75Of,
  ratingOf,
  statusOf,
} from "@telemetry/utils/telemetry-metric.util";

describe("telemetry metric helpers", () => {
  describe("bucketIndexOf", () => {
    it("places a value in the first bucket whose upper bound contains it", () => {
      expect(bucketIndexOf("LCP", 0)).toBe(0);
      expect(bucketIndexOf("LCP", 500)).toBe(0);
      expect(bucketIndexOf("LCP", 501)).toBe(1);
      expect(bucketIndexOf("INP", 200)).toBe(3);
      expect(bucketIndexOf("CLS", 0.1)).toBe(3);
    });

    it("keeps a value above the last bound in the last bucket", () => {
      for (const metric of Object.keys(
        TELEMETRY_METRIC_BUCKETS,
      ) as TelemetryMetric[]) {
        const { uppers, max } = TELEMETRY_METRIC_BUCKETS[metric];
        expect(bucketIndexOf(metric, max)).toBe(uppers.length - 1);
        expect(bucketIndexOf(metric, max * 2)).toBe(uppers.length - 1);
      }
    });

    it("aligns a bucket edge with each rating threshold so ratings stay exact", () => {
      for (const metric of Object.keys(
        TELEMETRY_METRIC_BUCKETS,
      ) as TelemetryMetric[]) {
        const { uppers, good, poor } = TELEMETRY_METRIC_BUCKETS[metric];
        expect(uppers).toContain(good);
        expect(uppers).toContain(poor);
        expect(
          uppers.every(
            (upper, index) => index === 0 || upper > uppers[index - 1],
          ),
        ).toBe(true);
      }
    });
  });

  describe("ratingOf", () => {
    it("matches the published Core Web Vitals thresholds", () => {
      expect(ratingOf("LCP", 2500)).toBe(TelemetryRating.GOOD);
      expect(ratingOf("LCP", 2501)).toBe(TelemetryRating.NEEDS_IMPROVEMENT);
      expect(ratingOf("LCP", 4000)).toBe(TelemetryRating.NEEDS_IMPROVEMENT);
      expect(ratingOf("LCP", 4001)).toBe(TelemetryRating.POOR);
      expect(ratingOf("INP", 200)).toBe(TelemetryRating.GOOD);
      expect(ratingOf("INP", 501)).toBe(TelemetryRating.POOR);
      expect(ratingOf("CLS", 0.1)).toBe(TelemetryRating.GOOD);
      expect(ratingOf("CLS", 0.26)).toBe(TelemetryRating.POOR);
    });
  });

  describe("isWithinMetricRange", () => {
    it("rejects negative, non-finite and out-of-range values", () => {
      expect(isWithinMetricRange("LCP", -1)).toBe(false);
      expect(isWithinMetricRange("LCP", Number.NaN)).toBe(false);
      expect(isWithinMetricRange("LCP", Number.POSITIVE_INFINITY)).toBe(false);
      expect(isWithinMetricRange("CLS", 10.01)).toBe(false);
      expect(isWithinMetricRange("CLS", 10)).toBe(true);
      expect(isWithinMetricRange("INP", 0)).toBe(true);
    });
  });

  describe("p75Of", () => {
    it("is zero without samples", () => {
      expect(p75Of("LCP", [])).toBe(0);
    });

    it("interpolates inside the bucket that crosses the 75th percentile", () => {
      expect(p75Of("LCP", [{ bucket: 4, count: 100 }])).toBeCloseTo(2375, 5);
      const split = [
        { bucket: 0, count: 50 },
        { bucket: 4, count: 50 },
      ];
      expect(p75Of("LCP", split)).toBeCloseTo(2000 + 0.5 * 500, 5);
    });

    it("does not depend on the order buckets arrive in", () => {
      const rows = [
        { bucket: 6, count: 10 },
        { bucket: 1, count: 70 },
        { bucket: 3, count: 20 },
      ];
      expect(p75Of("LCP", rows)).toBe(p75Of("LCP", [...rows].reverse()));
    });
  });

  describe("statusOf", () => {
    it("never reports a pass below the sample floor", () => {
      expect(statusOf("LCP", 100, TELEMETRY_LIMITS.minimumSamples - 1)).toBe(
        SearchHealthVitalStatus.INSUFFICIENT_DATA,
      );
    });

    it("rates the p75 once there are enough samples", () => {
      const samples = TELEMETRY_LIMITS.minimumSamples;
      expect(statusOf("LCP", 2000, samples)).toBe(SearchHealthVitalStatus.GOOD);
      expect(statusOf("LCP", 3000, samples)).toBe(
        SearchHealthVitalStatus.NEEDS_IMPROVEMENT,
      );
      expect(statusOf("LCP", 5000, samples)).toBe(SearchHealthVitalStatus.POOR);
    });
  });

  describe("day helpers", () => {
    it("truncates to the UTC day and counts back inclusively", () => {
      const instant = new Date("2026-10-12T23:59:59.000Z");
      expect(utcDay(instant).toISOString()).toBe("2026-10-12T00:00:00.000Z");
      expect(daysBefore(instant, 6).toISOString()).toBe(
        "2026-10-06T00:00:00.000Z",
      );
    });
  });
});
