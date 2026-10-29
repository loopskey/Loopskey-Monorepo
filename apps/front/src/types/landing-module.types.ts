import type { PodcastCategory, YouTubeCategory } from "@/lib/graphql/base";
import type { CourseCategory, EventCategory } from "@/lib/graphql/base";
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

// ================= Hero =================
export type TLandingHeroContentKind =
  | "course"
  | "event"
  | "podcast"
  | "youtube";

export type TLandingHeroCategory = {
  id: string;
  label: string;
  kind: TLandingHeroContentKind;
  value: CourseCategory | EventCategory | PodcastCategory | YouTubeCategory;
};

export type TLandingHeroResultItem = {
  id: string;
  slug: string;
  href: string;
  title: string;
  meta?: string | null;
  rating?: number | null;
  imageUrl?: string | null;
  category?: string | null;
  description?: string | null;
  kind: TLandingHeroContentKind;
};

export type THeroCategoryExplorerProps = {
  categories: TLandingHeroCategory[];
  selectedCategory: TLandingHeroCategory | null;
  onSelect: (category: TLandingHeroCategory) => void;
};

export type THeroSearchBoxProps = {
  value: string;
  placeholder: string;
  onClear: () => void;
  clearLabel: string;
  exploreLabel: string;
  isExplorerOpen: boolean;
  onToggleExplorer: () => void;
  onChange: (value: string) => void;
};
