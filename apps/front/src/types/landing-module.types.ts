import {
  CourseCategory,
  EventCategory,
  PodcastCategory,
  YouTubeCategory,
} from "@/lib/graphql/generated";

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
  kind: TLandingContentKind;
  description?: string | null;
  ratingCount?: number | null;
  metaPrimary?: string | null;
  metaSecondary?: string | null;
  price?: number | string | null;
};

export type TLandingTab = {
  label: string;
  description: string;
  value: TLandingContentKind;
};

export type TLearningHubTabsProps = {
  tabs: TLandingTab[];
  activeTab: TLandingContentKind;
  onChange: (tab: TLandingContentKind) => void;
};

export type TLandingContentCarouselProps = {
  items: TLandingContentItem[];
  activeItemId?: string | null;
  onItemHover: (item: TLandingContentItem) => void;
};

export type TLandingSlider = {
  isActive: boolean;
  onHover: () => void;
  item: TLandingContentItem;
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
