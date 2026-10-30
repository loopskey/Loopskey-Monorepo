import type { TContentCardItem } from "@/types/content-module.types";

// ================ Featured ================
export type TLandingHubRow = {
  id: "recommended" | "popular";
  title: string;
  isError: boolean;
  isLoading: boolean;
  refetch: () => void;
  viewAllHref: string;
  items: TContentCardItem[];
};

export type TLearningHubRowProps = {
  row: TLandingHubRow;
};

export type TLandingEmptyStateProps = {
  onRetry?: () => void;
  variant?: "empty" | "error";
};
