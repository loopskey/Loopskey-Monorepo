import type { ReactNode } from "react";

export type ChartLegendKind = "rect" | "line" | "dash" | "marker";

export type ChartLegendItem = {
  id: string;
  label: string;
  color?: string;
  kind?: ChartLegendKind;
};

export type ChartTooltipRow = {
  id: string;
  label: string;
  value: string;
  color?: string;
};

export type ChartTable = {
  caption: string;
  columns: string[];
  rows: { id: string; cells: (string | number)[] }[];
};

export type ChartError = {
  message: string;
  retryLabel: string;
  onRetry: () => void;
};

export type ChartFrameProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  legend?: ChartLegendItem[];
  table?: ChartTable;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyLabel?: string;
  error?: ChartError | null;
  skeletonClassName?: string;
  headingLevel?: "h2" | "h3";
  className?: string;
  children: ReactNode;
};

export type ChartLegendProps = {
  items: ChartLegendItem[];
  className?: string;
};

export type ChartTooltipContentProps = {
  title: string;
  rows: ChartTooltipRow[];
};

export type ChartStatusTone = "good" | "warning" | "critical" | "info";

export type ChartStatusProps = {
  tone: ChartStatusTone;
  children: ReactNode;
  className?: string;
};

export type ProgressMeterProps = {
  value: number;
  max: number;
  label: string;
  color?: string;
  size?: "md" | "sm";
  showScale?: boolean;
  marker?: { value: number; label: string };
  formatValue?: (value: number) => string;
  className?: string;
};

export type ProgressRingProps = {
  percent: number;
  label: string;
  value: string;
  caption?: string;
  color?: string;
  size?: number;
  thickness?: number;
  className?: string;
};

export type BarListRow = {
  id: string;
  label: string;
  value: number;
  description?: string;
  target?: number;
  color?: string;
  valueLabel?: ReactNode;
  tooltip?: ChartTooltipRow[];
};

export type BarListProps = {
  rows: BarListRow[];
  label: string;
  max?: number;
  valueName: string;
  targetName?: string;
  threshold?: { value: number; label: string };
  labelWidth?: "sm" | "md" | "lg";
  formatValue: (value: number) => string;
  onSelect?: (row: BarListRow) => void;
  className?: string;
};

export type ShareSegment = {
  id: string;
  label: string;
  value: number;
  color: string;
  isLightFill?: boolean;
};

export type ShareBarProps = {
  label: string;
  unitName: string;
  segments: ShareSegment[];
  size?: "md" | "sm";
  formatValue: (value: number) => string;
  formatShare: (share: number) => string;
  shareName: string;
  onSelect?: (segment: ShareSegment) => void;
  className?: string;
};

export type ShareLegendProps = {
  segments: ShareSegment[];
  formatValue: (value: number) => string;
  formatShare: (share: number) => string;
  onSelect?: (segment: ShareSegment) => void;
  className?: string;
};

export type TrendSeries = {
  key: string;
  label: string;
  color: string;
  variant?: "line" | "area" | "dashed";
  curve?: "smooth" | "linear" | "step";
  shortLabel?: string;
};

export type TrendDatum = Record<string, string | number | null>;

export type TrendChartProps = {
  label: string;
  data: TrendDatum[];
  xKey: string;
  series: TrendSeries[];
  height?: number;
  isStacked?: boolean;
  yDomain?: [number, number];
  showEndLabels?: boolean;
  formatValue: (value: number) => string;
  formatTick?: (value: number) => string;
  formatX?: (value: string) => string;
  formatTooltipX?: (value: string) => string;
  className?: string;
};

export type HeatmapColumn = { id: string; label: string };

export type HeatmapProps = {
  label: string;
  rowHeader: string;
  columns: HeatmapColumn[];
  scaleLabel: string;
  children: ReactNode;
  className?: string;
};

export type HeatmapRowProps = {
  label: string;
  columns: HeatmapColumn[];
  values: (number | null)[];
  emptyLabel: string;
  valueName: string;
  isLoading?: boolean;
  formatValue: (value: number) => string;
};

export type ChartChrome = Omit<
  ChartFrameProps,
  "children" | "legend" | "table" | "className"
>;
