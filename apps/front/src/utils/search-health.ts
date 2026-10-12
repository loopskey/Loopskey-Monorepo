import { TelemetryMetric } from "@/lib/graphql/base";

import type { TelemetryIntakeOutcome } from "@/lib/graphql/base";
import type { SearchHealthReport } from "@/lib/rtk/endpoints/telemetry.api";

export const REPORT_WINDOWS = [7, 28] as const;

export const METRIC_ORDER: readonly TelemetryMetric[] = [
  TelemetryMetric.Lcp,
  TelemetryMetric.Inp,
  TelemetryMetric.Cls,
];

const MILLISECOND_DECIMALS = 0;
const SCORE_DECIMALS = 3;

export const formatMetricValue = (metric: TelemetryMetric, value: number) =>
  metric === TelemetryMetric.Cls
    ? value.toFixed(SCORE_DECIMALS)
    : `${value.toFixed(MILLISECOND_DECIMALS)} ms`;

export const vitalsOf = (report: SearchHealthReport, metric: TelemetryMetric) =>
  report.vitals.filter((segment) => segment.metric === metric);

export const intakeTotal = (
  report: SearchHealthReport,
  outcome?: TelemetryIntakeOutcome,
) =>
  report.intake
    .filter((row) => outcome === undefined || row.outcome === outcome)
    .reduce((sum, row) => sum + row.count, 0);
