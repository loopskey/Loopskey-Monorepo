export const CHART_COLOR = {
  series1: "var(--chart-series-1)",
  series2: "var(--chart-series-2)",
  series3: "var(--chart-series-3)",
  good: "var(--chart-semantic-success)",
  onTrack: "var(--chart-semantic-on-track)",
  warning: "var(--chart-semantic-warning)",
  critical: "var(--chart-semantic-danger)",
  neutral: "var(--chart-semantic-neutral)",
  track: "var(--chart-track)",
} as const;

export const CHART_SEQUENCE = [
  "var(--chart-seq-1)",
  "var(--chart-seq-2)",
  "var(--chart-seq-3)",
  "var(--chart-seq-4)",
  "var(--chart-seq-5)",
  "var(--chart-seq-6)",
] as const;

export const HEATMAP_BINS = [0, 40, 50, 60, 70, 80] as const;

const DARK_TEXT_BINS = 2;

export const heatmapBin = (value: number) =>
  HEATMAP_BINS.reduce<number>(
    (bin, floor, index) => (value >= floor ? index : bin),
    0,
  );

export const isLightHeatmapBin = (bin: number) => bin < DARK_TEXT_BINS;

export const sharePercent = (value: number, total: number) =>
  total > 0 ? (value / total) * 100 : 0;

export const clampShare = (value: number, max: number) =>
  max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;

const NICE_STEPS = [1, 2, 5, 10] as const;
const TICK_COUNTS = [3, 4, 5] as const;
const HEADROOM = 1.04;

const niceStep = (raw: number) => {
  const power = 10 ** Math.floor(Math.log10(raw));
  return (NICE_STEPS.find((step) => raw / power <= step) ?? 10) * power;
};

export const niceTicks = (maxValue: number) => {
  const target = Math.max(maxValue * HEADROOM, 1);
  const best = TICK_COUNTS.map((count) => ({
    count,
    step: niceStep(target / count),
  })).reduce((winner, candidate) =>
    candidate.step * candidate.count < winner.step * winner.count
      ? candidate
      : winner,
  );
  return Array.from({ length: best.count + 1 }, (_, index) =>
    Number((best.step * index).toPrecision(12)),
  );
};
