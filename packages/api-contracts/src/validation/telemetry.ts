export const TELEMETRY_METRIC_BUCKETS = {
  LCP: {
    good: 2500,
    poor: 4000,
    max: 60000,
    uppers: [
      500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 5000, 6000, 8000, 12000,
      60000,
    ],
  },
  INP: {
    good: 200,
    poor: 500,
    max: 60000,
    uppers: [50, 100, 150, 200, 300, 400, 500, 750, 1000, 2000, 5000, 60000],
  },
  CLS: {
    good: 0.1,
    poor: 0.25,
    max: 10,
    uppers: [0.025, 0.05, 0.075, 0.1, 0.15, 0.2, 0.25, 0.4, 0.6, 1, 2.5, 10],
  },
} as const satisfies Record<
  "LCP" | "INP" | "CLS",
  { good: number; poor: number; max: number; uppers: readonly number[] }
>;

export const TELEMETRY_LIMITS = {
  vitalsPerBatchMax: 12,
  conversionsPerBatchMax: 8,
  eventIdMin: 12,
  eventIdMax: 64,
  dedupWindowHours: 24,
  aggregateRetentionDays: 395,
  minimumSamples: 100,
  reportWindowDaysMax: 90,
  ipWindowSeconds: 300,
  ipLimitPerWindow: 300,
  globalWindowSeconds: 60,
  globalLimitPerWindow: 3000,
} as const;
