import type { ChartError, ChartStatusTone } from "@/types/chart.types";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type StatCardSegment = {
  id: string;
  label: string;
  value: number;
  color: string;
};

export type StatCardChip = {
  tone: ChartStatusTone;
  label: string;
};

export type StatCardAction = {
  label: string;
  href: string;
};

export type StatCardEmpty = {
  hint: string;
  action?: StatCardAction;
};

export type StatCardError = ChartError;

export type StatCardProps = {
  title: string;
  href?: string;
  icon: LucideIcon;
  notes?: string[];
  ariaLabel?: string;
  linkLabel?: string;
  hasArrow?: boolean;
  isActive?: boolean;
  className?: string;
  chip?: StatCardChip;
  isLoading?: boolean;
  description?: string;
  empty?: StatCardEmpty;
  onSelect?: () => void;
  value: string | number;
  segments?: StatCardSegment[];
};

export type StatCardSplitProps = {
  label: string;
  className?: string;
  segments: StatCardSegment[];
};

export type StatCardSkeletonProps = {
  title: string;
  icon: LucideIcon;
  hasSplit?: boolean;
  className?: string;
};

export type StatCardGridColumns = 2 | 3 | 4 | 5;

export type StatCardGridProps = {
  className?: string;
  children: ReactNode;
  error?: StatCardError | null;
  columns?: StatCardGridColumns;
};
