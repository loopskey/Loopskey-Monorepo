import type { PodcastCategory, YouTubeCategory } from "@/lib/graphql/base";
import type { CourseCategory, EventCategory } from "@/lib/graphql/base";

// ================ Featured ================
export type TLandingContentKind = "course" | "event" | "podcast" | "youtube";

export type TLandingContentItem = {
  id: string;
  slug: string;
  href: string;
  title: string;
  rating?: number | null;
  status?: string | null;
  isFree?: boolean | null;
  imageUrl?: string | null;
  currency?: string | null;
  category?: string | null;
  categoryKey?: string | null;
  kind: TLandingContentKind;
  description?: string | null;
  ratingCount?: number | null;
  metaPrimary?: string | null;
  metaSecondary?: string | null;
  price?: number | string | null;
};

export type TLandingTab = {
  label: string;
  value: TLandingContentKind;
};

export type TLearningHubTabsProps = {
  tabs: TLandingTab[];
  activeTab: TLandingContentKind;
  onChange: (tab: TLandingContentKind) => void;
};

export type TLearningShelfProps = {
  nextTabLabel: string;
  onSequenceEnd: () => void;
  items: TLandingContentItem[];
};

export type TLearningShelfStageProps = {
  index: number;
  item: TLandingContentItem;
};

export type TLearningShelfSpineProps = {
  index: number;
  isActive: boolean;
  onSelect: () => void;
  item: TLandingContentItem;
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
  exploreLabel: string;
  isExplorerOpen: boolean;
  onToggleExplorer: () => void;
  onChange: (value: string) => void;
};
