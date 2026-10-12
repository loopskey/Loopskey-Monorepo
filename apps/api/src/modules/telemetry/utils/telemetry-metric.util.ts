import { TELEMETRY_METRIC_BUCKETS } from "@loopskey/api-contracts/validation";
import { SearchHealthVitalStatus } from "@telemetry/enums/telemetry-register.enum";
import { TELEMETRY_LIMITS } from "@loopskey/api-contracts/validation";
import { TelemetryRating } from "@telemetry/enums/telemetry-register.enum";

import type { TelemetryMetric } from "@prisma/client";

const P75 = 0.75;

export const bucketIndexOf = (metric: TelemetryMetric, value: number) => {
  const { uppers } = TELEMETRY_METRIC_BUCKETS[metric];
  const index = uppers.findIndex((upper) => value <= upper);
  return index === -1 ? uppers.length - 1 : index;
};

export const isWithinMetricRange = (metric: TelemetryMetric, value: number) =>
  Number.isFinite(value) &&
  value >= 0 &&
  value <= TELEMETRY_METRIC_BUCKETS[metric].max;

export const ratingOf = (metric: TelemetryMetric, value: number) => {
  const { good, poor } = TELEMETRY_METRIC_BUCKETS[metric];
  if (value <= good) return TelemetryRating.GOOD;
  return value <= poor
    ? TelemetryRating.NEEDS_IMPROVEMENT
    : TelemetryRating.POOR;
};

export const statusOf = (
  metric: TelemetryMetric,
  p75: number,
  samples: number,
) => {
  if (samples < TELEMETRY_LIMITS.minimumSamples)
    return SearchHealthVitalStatus.INSUFFICIENT_DATA;
  return SearchHealthVitalStatus[ratingOf(metric, p75)];
};

export type BucketCount = { bucket: number; count: number };

export const p75Of = (metric: TelemetryMetric, buckets: BucketCount[]) => {
  const { uppers } = TELEMETRY_METRIC_BUCKETS[metric];
  const total = buckets.reduce((sum, row) => sum + row.count, 0);
  if (total === 0) return 0;
  const target = total * P75;
  const ordered = [...buckets].sort(
    (left, right) => left.bucket - right.bucket,
  );
  let seen = 0;
  for (const row of ordered) {
    if (seen + row.count >= target) {
      const lower = row.bucket === 0 ? 0 : uppers[row.bucket - 1];
      const upper = uppers[row.bucket];
      return lower + ((target - seen) / row.count) * (upper - lower);
    }
    seen += row.count;
  }
  return uppers[uppers.length - 1];
};
